using Microsoft.EntityFrameworkCore;
using PictoIMS.API.Data;
using PictoIMS.API.Models;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace PictoIMS.API.Services
{
    public class RequisitionService : IRequisitionService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<RequisitionService> _logger;

        public RequisitionService(ApplicationDbContext context, ILogger<RequisitionService> logger)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        #region Active Requisition Operations

        public async Task<List<RequisitionForm>> GetAllAsync(bool includeDrafts = true)
        {
            try
            {
                var query = _context.RequisitionForms.Where(f => !f.IsArchived);

                if (!includeDrafts)
                {
                    query = query.Where(f => f.DateRequested.HasValue);
                }

                return await query
                    .OrderByDescending(f => f.DateRequested)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving all requisition forms");
                throw new RequisitionServiceException("Failed to retrieve requisition forms", ex);
            }
        }

        public async Task<RequisitionForm?> GetByIdAsync(string id)
        {
            if (string.IsNullOrWhiteSpace(id))
                throw new ArgumentException("ID cannot be null or empty", nameof(id));

            try
            {
                return await _context.RequisitionForms
                    .Where(f => f.RfId == id && !f.IsArchived)
                    .FirstOrDefaultAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving requisition form with ID {Id}", id);
                throw new RequisitionServiceException($"Failed to retrieve requisition form with ID {id}", ex);
            }
        }

        public async Task<RequisitionForm> CreateAsync(RequisitionForm form, string? createdBy = null)
        {
            if (form == null)
                throw new ArgumentNullException(nameof(form));

            // Validate the form
            ValidateForm(form);

            try
            {
                // Ensure all dates are UTC
                form.DateRequested = form.DateRequested?.ToUniversalTime() ?? DateTime.UtcNow;
                form.CheckedByDate = form.CheckedByDate?.ToUniversalTime();
                form.ApprovedByDate = form.ApprovedByDate?.ToUniversalTime();
                form.IssuedByDate = form.IssuedByDate?.ToUniversalTime();
                form.ReceivedByDate = form.ReceivedByDate?.ToUniversalTime();

                form.IsArchived = false;

                // Generate RS number if not provided
                if (string.IsNullOrWhiteSpace(form.RsNumber))
                {
                    form.RsNumber = await GenerateRsNumberAsync();
                }

                _context.RequisitionForms.Add(form);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Created new requisition form with ID {RfId} by {CreatedBy}",
                    form.RfId, createdBy ?? "system");
                return form;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating requisition form");
                throw new RequisitionServiceException("Failed to create requisition form", ex);
            }
        }

        public async Task<bool> UpdateAsync(string id, RequisitionForm form, string? updatedBy)
        {
            var existing = await _context.RequisitionForms.FindAsync(id);
            if (existing == null) return false;

            // Update only the fields you want to allow changes to
            existing.RsNumber = form.RsNumber;
            existing.RfNumber = form.RfNumber;
            existing.RequesterName = form.RequesterName;
            existing.RequesterPosition = form.RequesterPosition;
            existing.Department = form.Department;
            existing.Purpose = form.Purpose;
            existing.DateRequested = form.DateRequested;
            existing.CheckedByName = form.CheckedByName;
            existing.CheckedByPosition = form.CheckedByPosition;
            existing.CheckedByDate = form.CheckedByDate;
            existing.ApprovedByName = form.ApprovedByName;
            existing.ApprovedByPosition = form.ApprovedByPosition;
            existing.ApprovedByDate = form.ApprovedByDate;
            existing.IssuedByName = form.IssuedByName;
            existing.IssuedByPosition = form.IssuedByPosition;
            existing.IssuedByDate = form.IssuedByDate;
            existing.ReceivedByName = form.ReceivedByName;
            existing.ReceivedByPosition = form.ReceivedByPosition;
            existing.ReceivedByDate = form.ReceivedByDate;
            existing.IsArchived = form.IsArchived;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<RequisitionForm>> SearchAsync(
            string? department = null,
            string? requesterName = null,
            DateTime? dateFrom = null,
            DateTime? dateTo = null,
            string? status = null,
            string? rsNumber = null,
            string? rfNumber = null)
        {
            try
            {
                var query = _context.RequisitionForms.Where(f => !f.IsArchived);

                if (!string.IsNullOrWhiteSpace(department))
                    query = query.Where(f => f.Department.Contains(department));

                if (!string.IsNullOrWhiteSpace(requesterName))
                    query = query.Where(f => f.RequesterName.Contains(requesterName));

                if (!string.IsNullOrWhiteSpace(rsNumber))
                    query = query.Where(f => f.RsNumber != null && f.RsNumber.Contains(rsNumber));

                if (!string.IsNullOrWhiteSpace(rfNumber))
                    query = query.Where(f => f.RfNumber != null && f.RfNumber.Contains(rfNumber));

                if (dateFrom.HasValue)
                    query = query.Where(f => f.DateRequested >= dateFrom.Value.ToUniversalTime());

                if (dateTo.HasValue)
                    query = query.Where(f => f.DateRequested <= dateTo.Value.ToUniversalTime());

                var results = await query.OrderByDescending(f => f.DateRequested).ToListAsync();

                // Filter by status if provided (computed property)
                if (!string.IsNullOrWhiteSpace(status))
                {
                    results = results.Where(f => f.WorkflowStatus.Equals(status, StringComparison.OrdinalIgnoreCase))
                        .ToList();
                }

                return results;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error searching requisition forms");
                throw new RequisitionServiceException("Failed to search requisition forms", ex);
            }
        }

        #endregion

        #region Archive Operations

        public async Task<bool> SoftDeleteAsync(
            string id,
            string reason = "Archived via API",
            string archivedBy = "system",
            string? additionalMetadata = null)
        {
            if (string.IsNullOrWhiteSpace(id))
                throw new ArgumentException("ID cannot be null or empty", nameof(id));

            _logger.LogInformation("Starting soft delete for ID: {Id}", id);

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // Check if already archived
                var existingArchive = await _context.RequisitionArchives
                    .FirstOrDefaultAsync(a => a.RfId == id);

                if (existingArchive != null)
                {
                    _logger.LogWarning("Item {Id} is already archived", id);
                    return false;
                }

                var form = await _context.RequisitionForms
                    .Where(f => f.RfId == id && !f.IsArchived)
                    .FirstOrDefaultAsync();

                if (form == null)
                {
                    _logger.LogWarning("Form not found for soft delete: {Id}", id);
                    return false;
                }

                // Create archive record
                var archive = RequisitionArchive.FromRequisitionForm(form, reason, archivedBy);

                if (!string.IsNullOrWhiteSpace(additionalMetadata))
                {
                    archive.ArchiveMetadata = additionalMetadata;
                }

                _context.RequisitionArchives.Add(archive);
                _context.RequisitionForms.Remove(form);

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                _logger.LogInformation("Successfully completed soft delete for: {Id}", id);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during soft delete for ID: {Id}", id);
                await transaction.RollbackAsync();
                throw new RequisitionServiceException($"Failed to archive requisition form with ID {id}", ex);
            }
        }

        public async Task<int> SoftDeleteBulkAsync(
            List<string> ids,
            string reason = "Bulk archive operation",
            string archivedBy = "system")
        {
            if (ids == null || !ids.Any())
                throw new ArgumentException("IDs list cannot be null or empty", nameof(ids));

            _logger.LogInformation("Starting bulk delete for {Count} IDs", ids.Count);

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // Get existing archives to avoid duplicates
                var existingArchives = await _context.RequisitionArchives
                    .Where(a => ids.Contains(a.RfId))
                    .Select(a => a.RfId)
                    .ToListAsync();

                var idsToProcess = ids.Except(existingArchives).ToList();

                if (!idsToProcess.Any())
                {
                    _logger.LogWarning("All items are already archived, nothing to process");
                    return 0;
                }

                var forms = await _context.RequisitionForms
                    .Where(f => idsToProcess.Contains(f.RfId) && !f.IsArchived)
                    .ToListAsync();

                if (!forms.Any())
                {
                    _logger.LogWarning("No active forms found to archive");
                    return 0;
                }

                var archives = forms.Select(f =>
                    RequisitionArchive.FromRequisitionForm(f, reason, archivedBy))
                    .ToList();

                _context.RequisitionArchives.AddRange(archives);
                _context.RequisitionForms.RemoveRange(forms);

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                _logger.LogInformation("Successfully archived {Count} requisitions", forms.Count);
                return forms.Count;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during bulk delete operation");
                await transaction.RollbackAsync();
                throw new RequisitionServiceException("Failed to perform bulk archive operation", ex);
            }
        }

        public async Task<bool> HardDeleteAsync(string id)
        {
            if (string.IsNullOrWhiteSpace(id))
                throw new ArgumentException("ID cannot be null or empty", nameof(id));

            try
            {
                var archive = await _context.RequisitionArchives
                    .FirstOrDefaultAsync(a => a.RfId == id);

                if (archive == null)
                {
                    _logger.LogWarning("Attempted to permanently delete non-existent archived requisition form with ID {Id}", id);
                    return false;
                }

                _context.RequisitionArchives.Remove(archive);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Permanently deleted archived requisition form with ID {RfId}", id);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error permanently deleting archived requisition form with ID {Id}", id);
                throw new RequisitionServiceException($"Failed to permanently delete archived form with ID {id}", ex);
            }
        }

        public async Task<bool> RestoreAsync(string id, string restoredBy = "system")
        {
            if (string.IsNullOrWhiteSpace(id))
                throw new ArgumentException("ID cannot be null or empty", nameof(id));

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var archive = await _context.RequisitionArchives
                    .FirstOrDefaultAsync(a => a.RfId == id);

                if (archive == null || !archive.IsRestorable)
                {
                    return false;
                }

                // Create restored form
                var restoredForm = new RequisitionForm
                {
                    RfId = archive.RfId,
                    RsNumber = archive.RsNumber,
                    RfNumber = archive.RfNumber,
                    RequesterName = archive.RequesterName!,
                    RequesterPosition = archive.RequesterPosition!,
                    Department = archive.Department!,
                    Purpose = archive.Purpose!,
                    DateRequested = archive.DateRequested,
                    CheckedByName = archive.CheckedByName,
                    CheckedByPosition = archive.CheckedByPosition,
                    CheckedByDate = archive.CheckedByDate,
                    ApprovedByName = archive.ApprovedByName,
                    ApprovedByPosition = archive.ApprovedByPosition,
                    ApprovedByDate = archive.ApprovedByDate,
                    IssuedByName = archive.IssuedByName,
                    IssuedByPosition = archive.IssuedByPosition,
                    IssuedByDate = archive.IssuedByDate,
                    ReceivedByName = archive.ReceivedByName,
                    ReceivedByPosition = archive.ReceivedByPosition,
                    ReceivedByDate = archive.ReceivedByDate,
                    IsArchived = false
                };

                _context.RequisitionForms.Add(restoredForm);
                _context.RequisitionArchives.Remove(archive);

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                _logger.LogInformation("Successfully restored requisition form with ID {Id} by {RestoredBy}",
                    id, restoredBy);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error restoring requisition form with ID {Id}", id);
                await transaction.RollbackAsync();
                throw new RequisitionServiceException($"Failed to restore requisition form with ID {id}", ex);
            }
        }

        #endregion

        #region Archive Retrieval Operations

        public async Task<List<RequisitionArchive>> GetAllArchivedAsync(bool includeExpired = false)
        {
            try
            {
                var query = _context.RequisitionArchives.AsQueryable();

                if (!includeExpired)
                {
                    query = query.Where(a => !a.RetentionExpiresAt.HasValue ||
                        a.RetentionExpiresAt > DateTime.UtcNow);
                }

                return await query
                    .OrderByDescending(a => a.ArchivedAt)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving archived requisition forms");
                throw new RequisitionServiceException("Failed to retrieve archived forms", ex);
            }
        }

        public async Task<RequisitionArchive?> GetArchivedByIdAsync(string id)
        {
            if (string.IsNullOrWhiteSpace(id))
                throw new ArgumentException("ID cannot be null or empty", nameof(id));

            try
            {
                return await _context.RequisitionArchives
                    .FirstOrDefaultAsync(a => a.RfId == id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving archived requisition form with ID {Id}", id);
                throw new RequisitionServiceException($"Failed to retrieve archived form with ID {id}", ex);
            }
        }

        public async Task<List<RequisitionArchive>> SearchArchivedAsync(
            DateTime? dateFrom = null,
            DateTime? dateTo = null,
            DateTime? archivedFrom = null,
            DateTime? archivedTo = null,
            string? keyword = null,
            string? archivedBy = null,
            string? department = null)
        {
            try
            {
                var query = _context.RequisitionArchives.AsQueryable();

                if (dateFrom.HasValue)
                    query = query.Where(a => a.DateRequested >= dateFrom.Value.ToUniversalTime());

                if (dateTo.HasValue)
                    query = query.Where(a => a.DateRequested <= dateTo.Value.ToUniversalTime());

                if (archivedFrom.HasValue)
                    query = query.Where(a => a.ArchivedAt >= archivedFrom.Value.ToUniversalTime());

                if (archivedTo.HasValue)
                    query = query.Where(a => a.ArchivedAt <= archivedTo.Value.ToUniversalTime());

                if (!string.IsNullOrWhiteSpace(keyword))
                    query = query.Where(a =>
                        (a.RequesterName != null && a.RequesterName.Contains(keyword)) ||
                        (a.Purpose != null && a.Purpose.Contains(keyword)));

                if (!string.IsNullOrWhiteSpace(archivedBy))
                    query = query.Where(a => a.ArchivedBy == archivedBy);

                if (!string.IsNullOrWhiteSpace(department))
                    query = query.Where(a => a.Department == department);

                return await query.OrderByDescending(a => a.ArchivedAt).ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error searching archived requisition forms");
                throw new RequisitionServiceException("Failed to search archived forms", ex);
            }
        }

        #endregion

        #region Maintenance Operations

        public async Task<int> CleanupExpiredArchivesAsync(bool dryRun = false)
        {
            try
            {
                var expiredArchives = await _context.RequisitionArchives
                    .Where(a => a.RetentionExpiresAt.HasValue &&
                        a.RetentionExpiresAt < DateTime.UtcNow)
                    .ToListAsync();

                var count = expiredArchives.Count;

                if (!dryRun && count > 0)
                {
                    _context.RequisitionArchives.RemoveRange(expiredArchives);
                    await _context.SaveChangesAsync();

                    _logger.LogInformation("Cleaned up {Count} expired archived records", count);
                }

                return count;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error cleaning up expired archives");
                throw new RequisitionServiceException("Failed to cleanup expired archives", ex);
            }
        }

        public async Task<Dictionary<string, object>> GetStatisticsAsync()
        {
            try
            {
                var stats = new Dictionary<string, object>();

                // Counts that can be done directly
                stats["TotalActive"] = await _context.RequisitionForms.CountAsync(f => !f.IsArchived);
                stats["TotalArchived"] = await _context.RequisitionArchives.CountAsync();

                // Group workflow statuses on the DB side
                var statusCounts = await _context.RequisitionForms
                    .Where(f => !f.IsArchived)
                    .GroupBy(f => f.WorkflowStatus)
                    .Select(g => new { Status = g.Key, Count = g.Count() })
                    .ToListAsync();

                // Initialize all counts at zero
                stats["PendingCount"] = 0;
                stats["CheckedCount"] = 0;
                stats["ApprovedCount"] = 0;
                stats["IssuedCount"] = 0;
                stats["CompletedCount"] = 0;

                // Fill in counts that exist in DB
                foreach (var sc in statusCounts)
                {
                    switch (sc.Status)
                    {
                        case "Pending": stats["PendingCount"] = sc.Count; break;
                        case "Checked": stats["CheckedCount"] = sc.Count; break;
                        case "Approved": stats["ApprovedCount"] = sc.Count; break;
                        case "Issued": stats["IssuedCount"] = sc.Count; break;
                        case "Completed": stats["CompletedCount"] = sc.Count; break;
                    }
                }

                return stats;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating statistics");
                throw new RequisitionServiceException("Failed to generate statistics", ex);
            }
        }

        public async Task<List<string>> ValidateWorkflowIntegrityAsync(string id)
        {
            if (string.IsNullOrWhiteSpace(id))
                throw new ArgumentException("ID cannot be null or empty", nameof(id));

            var errors = new List<string>();

            try
            {
                var form = await GetByIdAsync(id);
                if (form == null)
                {
                    errors.Add("Form not found");
                    return errors;
                }

                if (!form.IsWorkflowSequenceValid())
                {
                    errors.Add("Workflow dates are not in correct sequence");
                }

                // Additional validation rules
                if (form.CheckedByDate.HasValue && string.IsNullOrWhiteSpace(form.CheckedByName))
                {
                    errors.Add("Checked date is set but checker name is missing");
                }

                if (form.ApprovedByDate.HasValue && string.IsNullOrWhiteSpace(form.ApprovedByName))
                {
                    errors.Add("Approved date is set but approver name is missing");
                }

                if (form.IssuedByDate.HasValue && string.IsNullOrWhiteSpace(form.IssuedByName))
                {
                    errors.Add("Issued date is set but issuer name is missing");
                }

                if (form.ReceivedByDate.HasValue && string.IsNullOrWhiteSpace(form.ReceivedByName))
                {
                    errors.Add("Received date is set but receiver name is missing");
                }

                return errors;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating workflow integrity for ID {Id}", id);
                throw new RequisitionServiceException($"Failed to validate workflow for form ID {id}", ex);
            }
        }

        #endregion

        #region Private Helper Methods

        private void ValidateForm(RequisitionForm form)
        {
            var context = new ValidationContext(form);
            var results = new List<ValidationResult>();

            if (!Validator.TryValidateObject(form, context, results, true))
            {
                var errorMessage = string.Join(", ", results.Select(r => r.ErrorMessage));
                throw new ValidationException($"Form validation failed: {errorMessage}");
            }
        }

        private async Task<string> GenerateRsNumberAsync()
        {
            var year = DateTime.UtcNow.Year;
            var prefix = $"RS{year}";

            var lastNumber = await _context.RequisitionForms
                .Where(f => f.RsNumber != null && f.RsNumber.StartsWith(prefix))
                .CountAsync();

            return $"{prefix}{(lastNumber + 1).ToString("D4")}";
        }
        #endregion
    }
}

using Microsoft.EntityFrameworkCore;
using PictoIMS.API.Data;
using PictoIMS.API.Models;
using System;
using System.Collections.Generic;
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
            _context = context;
            _logger = logger;
        }

        public async Task<List<RequisitionForm>> GetAllAsync()
        {
            // All dates are handled in UTC. The client is responsible for converting to local time.
            return await _context.RequisitionForms
                .Where(f => !f.IsArchived)
                .OrderByDescending(f => f.DateRequested)
                .ToListAsync();
        }

        public async Task<RequisitionForm?> GetByIdAsync(int id)
        {
            // All dates are handled in UTC.
            return await _context.RequisitionForms
                .Where(f => f.RfId == id && !f.IsArchived)
                .FirstOrDefaultAsync();
        }

        public async Task<RequisitionForm> CreateAsync(RequisitionForm form)
        {
            // Ensure all incoming dates are treated as UTC.
            // Set the requested date to now (UTC) if not provided.
            form.DateRequested = form.DateRequested?.ToUniversalTime() ?? DateTime.UtcNow;
            form.CheckedByDate = form.CheckedByDate?.ToUniversalTime();
            form.ApprovedByDate = form.ApprovedByDate?.ToUniversalTime();
            form.IssuedByDate = form.IssuedByDate?.ToUniversalTime();
            form.ReceivedByDate = form.ReceivedByDate?.ToUniversalTime();

            form.IsArchived = false;

            _context.RequisitionForms.Add(form);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Created new requisition form with ID {RfId}", form.RfId);
            return form;
        }

        public async Task<bool> UpdateAsync(int id, RequisitionForm form)
        {
            var existing = await _context.RequisitionForms
                .Where(f => f.RfId == id && !f.IsArchived)
                .FirstOrDefaultAsync();

            if (existing == null)
            {
                _logger.LogWarning("Attempted to update non-existent requisition form with ID {Id}", id);
                return false;
            }

            // Ensure all incoming date properties for the update are converted to UTC.
            existing.RequesterName = form.RequesterName;
            existing.RequesterPosition = form.RequesterPosition;
            existing.Department = form.Department;
            existing.Purpose = form.Purpose;
            existing.DateRequested = form.DateRequested?.ToUniversalTime();
            existing.CheckedByName = form.CheckedByName;
            existing.CheckedByPosition = form.CheckedByPosition;
            existing.CheckedByDate = form.CheckedByDate?.ToUniversalTime();
            existing.ApprovedByName = form.ApprovedByName;
            existing.ApprovedByPosition = form.ApprovedByPosition;
            existing.ApprovedByDate = form.ApprovedByDate?.ToUniversalTime();
            existing.IssuedByName = form.IssuedByName;
            existing.IssuedByPosition = form.IssuedByPosition;
            existing.IssuedByDate = form.IssuedByDate?.ToUniversalTime();
            existing.ReceivedByName = form.ReceivedByName;
            existing.ReceivedByPosition = form.ReceivedByPosition;
            existing.ReceivedByDate = form.ReceivedByDate?.ToUniversalTime();

            try
            {
                await _context.SaveChangesAsync();
                _logger.LogInformation("Updated requisition form with ID {RfId}", id);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating requisition form with ID {Id}", id);
                throw; // Re-throw to be caught by the controller's error handler.
            }
        }

        public async Task<bool> SoftDeleteAsync(int id)
        {
            var form = await _context.RequisitionForms
                .Where(f => f.RfId == id && !f.IsArchived)
                .FirstOrDefaultAsync();

            if (form == null)
            {
                _logger.LogWarning("Attempted to archive non-existent requisition form with ID {Id}", id);
                return false;
            }

            // Use a transaction to ensure the move is atomic.
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // Create an archive entry by copying data from the original form.
                var archive = new RequisitionArchive
                {
                    RfId = form.RfId, // Re-use the same ID.
                    RequesterName = form.RequesterName,
                    RequesterPosition = form.RequesterPosition,
                    Department = form.Department,
                    Purpose = form.Purpose,
                    DateRequested = form.DateRequested, // Dates are already UTC.
                    CheckedByName = form.CheckedByName,
                    CheckedByPosition = form.CheckedByPosition,
                    CheckedByDate = form.CheckedByDate,
                    ApprovedByName = form.ApprovedByName,
                    ApprovedByPosition = form.ApprovedByPosition,
                    ApprovedByDate = form.ApprovedByDate,
                    IssuedByName = form.IssuedByName,
                    IssuedByPosition = form.IssuedByPosition,
                    IssuedByDate = form.IssuedByDate,
                    ReceivedByName = form.ReceivedByName,
                    ReceivedByPosition = form.ReceivedByPosition,
                    ReceivedByDate = form.ReceivedByDate,
                    IsArchived = true
                };

                _context.RequisitionArchives.Add(archive);
                _context.RequisitionForms.Remove(form);

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                _logger.LogInformation("Archived requisition form with ID {RfId}", id);
                return true;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Error archiving requisition form with ID {Id}", id);
                throw; // Re-throw to be caught by the controller's error handler.
            }
        }

        public async Task<bool> HardDeleteAsync(int id)
        {
            var archive = await _context.RequisitionArchives
                .FirstOrDefaultAsync(a => a.RfId == id);

            if (archive == null)
            {
                _logger.LogWarning("Attempted to permanently delete non-existent archived requisition form with ID {Id}", id);
                return false;
            }

            try
            {
                _context.RequisitionArchives.Remove(archive);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Permanently deleted archived requisition form with ID {RfId}", id);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error permanently deleting archived requisition form with ID {Id}", id);
                throw; // Re-throw to be caught by the controller's error handler.
            }
        }

        public async Task<List<RequisitionArchive>> GetAllArchivedAsync()
        {
            // All dates are handled in UTC.
            return await _context.RequisitionArchives
                .OrderByDescending(a => a.DateRequested)
                .ToListAsync();
        }

        public async Task<RequisitionArchive?> GetArchivedByIdAsync(int id)
        {
            return await _context.RequisitionArchives
                .FirstOrDefaultAsync(a => a.RfId == id);
        }

    }
}
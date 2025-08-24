using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using PictoIMS.API.Models;

namespace PictoIMS.API.Services
{
    /// <summary>
    /// Interface defining operations for requisition form management.
    /// Handles both active forms and archived records with comprehensive error handling.
    /// </summary>
    public interface IRequisitionService
    {
        #region Active Requisition Operations

        /// <summary>
        /// Searches active requisition forms based on criteria
        /// </summary>
        /// <param name="department">Filter by department</param>
        /// <param name="requesterName">Filter by requester name</param>
        /// <param name="dateFrom">Filter by request date from</param>
        /// <param name="dateTo">Filter by request date to</param>
        /// <param name="status">Filter by workflow status</param>
        /// <param name="rsNumber">Filter by RS Number</param>
        /// <param name="rfNumber">Filter by RF Number</param>
        /// <returns>Filtered list of requisition forms</returns>
        Task<List<RequisitionForm>> SearchAsync(
            string? department = null,
            string? requesterName = null,
            DateTime? dateFrom = null,
            DateTime? dateTo = null,
            string? status = null,
            string? rsNumber = null, // Added
            string? rfNumber = null  // Added
        );

        /// <summary>
        /// Retrieves all active (non-archived) requisition forms
        /// </summary>
        /// <param name="includeDrafts">Whether to include draft forms</param>
        /// <returns>List of active requisition forms ordered by request date (newest first)</returns>
        /// <exception cref="InvalidOperationException">Thrown when database is unavailable</exception>
        Task<List<RequisitionForm>> GetAllAsync(bool includeDrafts = true);

        /// <summary>
        /// Retrieves a specific active requisition form by ID
        /// </summary>
        /// <param name="id">Unique identifier of the requisition form</param>
        /// <returns>Requisition form if found, null otherwise</returns>
        /// <exception cref="ArgumentException">Thrown when ID is null or empty</exception>
        /// <exception cref="InvalidOperationException">Thrown when database is unavailable</exception>
        Task<RequisitionForm?> GetByIdAsync(string id);

        /// <summary>
        /// Creates a new requisition form with validation and auto-numbering
        /// </summary>
        /// <param name="form">Requisition form data to create</param>
        /// <param name="createdBy">User creating the form</param>
        /// <returns>Created form with generated ID and timestamps</returns>
        /// <exception cref="ArgumentNullException">Thrown when form is null</exception>
        /// <exception cref="ValidationException">Thrown when form data is invalid</exception>
        /// <exception cref="InvalidOperationException">Thrown when creation fails</exception>
        Task<RequisitionForm> CreateAsync(RequisitionForm form, string? createdBy = null);

        /// <summary>
        /// Updates an existing active requisition form
        /// </summary>
        /// <param name="id">ID of the form to update</param>
        /// <param name="form">Updated form data</param>
        /// <param name="updatedBy">User performing the update</param>
        /// <returns>True if update successful, false if form not found</returns>
        /// <exception cref="ArgumentException">Thrown when ID is invalid</exception>
        /// <exception cref="ArgumentNullException">Thrown when form is null</exception>
        /// <exception cref="ValidationException">Thrown when updated data is invalid</exception>
        /// <exception cref="InvalidOperationException">Thrown when update fails</exception>
        Task<bool> UpdateAsync(string id, RequisitionForm form, string? updatedBy = null);

        #endregion

        #region Archive Operations

        /// <summary>
        /// Performs soft delete by moving form to archive table
        /// </summary>
        /// <param name="id">ID of the form to archive</param>
        /// <param name="reason">Reason for archiving</param>
        /// <param name="archivedBy">User/system performing the archive</param>
        /// <param name="additionalMetadata">Additional archiving metadata</param>
        /// <returns>True if archive successful, false if form not found</returns>
        /// <exception cref="ArgumentException">Thrown when ID is invalid</exception>
        /// <exception cref="InvalidOperationException">Thrown when archive operation fails</exception>
        Task<bool> SoftDeleteAsync(
            string id,
            string reason = "Archived via API",
            string archivedBy = "system",
            string? additionalMetadata = null);

        /// <summary>
        /// Performs bulk soft delete operation for multiple forms
        /// </summary>
        /// <param name="ids">List of form IDs to archive</param>
        /// <param name="reason">Reason for bulk archiving</param>
        /// <param name="archivedBy">User/system performing the bulk archive</param>
        /// <returns>Number of successfully archived forms</returns>
        /// <exception cref="ArgumentException">Thrown when IDs list is null or empty</exception>
        /// <exception cref="InvalidOperationException">Thrown when bulk operation fails</exception>
        Task<int> SoftDeleteBulkAsync(
            List<string> ids,
            string reason = "Bulk archive operation",
            string archivedBy = "system");

        /// <summary>
        /// Permanently deletes an archived requisition form
        /// </summary>
        /// <param name="id">ID of the archived form to delete permanently</param>
        /// <returns>True if deletion successful, false if archived form not found</returns>
        /// <exception cref="ArgumentException">Thrown when ID is invalid</exception>
        /// <exception cref="InvalidOperationException">Thrown when hard delete fails</exception>
        Task<bool> HardDeleteAsync(string id);

        /// <summary>
        /// Restores an archived form back to active status
        /// </summary>
        /// <param name="id">ID of the archived form to restore</param>
        /// <param name="restoredBy">User performing the restoration</param>
        /// <returns>True if restoration successful, false if archived form not found or not restorable</returns>
        /// <exception cref="ArgumentException">Thrown when ID is invalid</exception>
        /// <exception cref="InvalidOperationException">Thrown when restore operation fails</exception>
        Task<bool> RestoreAsync(string id, string restoredBy = "system");

        #endregion

        #region Archive Retrieval Operations

        /// <summary>
        /// Retrieves all archived requisition forms
        /// </summary>
        /// <param name="includeExpired">Whether to include expired archived records</param>
        /// <returns>List of archived forms ordered by archive date (newest first)</returns>
        /// <exception cref="InvalidOperationException">Thrown when database is unavailable</exception>
        Task<List<RequisitionArchive>> GetAllArchivedAsync(bool includeExpired = false);

        /// <summary>
        /// Retrieves a specific archived requisition form by original ID
        /// </summary>
        /// <param name="id">Original ID of the requisition form</param>
        /// <returns>Archived form if found, null otherwise</returns>
        /// <exception cref="ArgumentException">Thrown when ID is null or empty</exception>
        /// <exception cref="InvalidOperationException">Thrown when database is unavailable</exception>
        Task<RequisitionArchive?> GetArchivedByIdAsync(string id);

        /// <summary>
        /// Searches archived requisition forms based on multiple criteria
        /// </summary>
        /// <param name="dateFrom">Filter by original request date from</param>
        /// <param name="dateTo">Filter by original request date to</param>
        /// <param name="archivedFrom">Filter by archive date from</param>
        /// <param name="archivedTo">Filter by archive date to</param>
        /// <param name="keyword">Search keyword in requester name, department, or purpose</param>
        /// <param name="archivedBy">Filter by who archived the record</param>
        /// <param name="department">Filter by original department</param>
        /// <returns>Filtered list of archived forms</returns>
        Task<List<RequisitionArchive>> SearchArchivedAsync(
            DateTime? dateFrom = null,
            DateTime? dateTo = null,
            DateTime? archivedFrom = null,
            DateTime? archivedTo = null,
            string? keyword = null,
            string? archivedBy = null,
            string? department = null);

        #endregion

        #region Maintenance Operations

        /// <summary>
        /// Cleans up expired archived records based on retention policy
        /// </summary>
        /// <param name="dryRun">If true, returns count without actually deleting</param>
        /// <returns>Number of expired records that were (or would be) deleted</returns>
        /// <exception cref="InvalidOperationException">Thrown when cleanup operation fails</exception>
        Task<int> CleanupExpiredArchivesAsync(bool dryRun = false);

        /// <summary>
        /// Gets statistics about active and archived requisitions
        /// </summary>
        /// <returns>Dictionary containing various statistics</returns>
        Task<Dictionary<string, object>> GetStatisticsAsync();

        /// <summary>
        /// Validates the integrity of the requisition workflow for a form
        /// </summary>
        /// <param name="id">ID of the form to validate</param>
        /// <returns>List of validation errors, empty if valid</returns>
        Task<List<string>> ValidateWorkflowIntegrityAsync(string id);

        #endregion
    }

    /// <summary>
    /// Custom exception for requisition service operations
    /// </summary>
    public class RequisitionServiceException : Exception
    {
        public string? ErrorCode { get; }
        public Dictionary<string, object>? ErrorData { get; }

        public RequisitionServiceException(string message) : base(message) { }

        public RequisitionServiceException(string message, Exception innerException) : base(message, innerException) { }

        public RequisitionServiceException(string message, string errorCode, Dictionary<string, object>? errorData = null)
            : base(message)
        {
            ErrorCode = errorCode;
            ErrorData = errorData;
        }
    }

    /// <summary>
    /// Result wrapper for operations that may partially succeed
    /// </summary>
    public class OperationResult<T>
    {
        public bool IsSuccess { get; set; }
        public T? Data { get; set; }
        public string? ErrorMessage { get; set; }
        public List<string> Warnings { get; set; } = new();
        public Dictionary<string, object>? Metadata { get; set; }

        public static OperationResult<T> Success(T data, Dictionary<string, object>? metadata = null)
        {
            return new OperationResult<T>
            {
                IsSuccess = true,
                Data = data,
                Metadata = metadata
            };
        }

        public static OperationResult<T> Failure(string errorMessage, Dictionary<string, object>? metadata = null)
        {
            return new OperationResult<T>
            {
                IsSuccess = false,
                ErrorMessage = errorMessage,
                Metadata = metadata
            };
        }

        public static OperationResult<T> Warning(T data, string warning, Dictionary<string, object>? metadata = null)
        {
            return new OperationResult<T>
            {
                IsSuccess = true,
                Data = data,
                Warnings = new List<string> { warning },
                Metadata = metadata
            };
        }
    }
}

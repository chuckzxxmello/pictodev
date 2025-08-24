using Microsoft.AspNetCore.Mvc;
using PictoIMS.API.Models;
using PictoIMS.API.Services;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace PictoIMS.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Produces("application/json")]
    public class RequisitionController : ControllerBase
    {
        private readonly IRequisitionService _service;
        private readonly ILogger<RequisitionController> _logger;

        public RequisitionController(IRequisitionService service, ILogger<RequisitionController> logger)
        {
            _service = service ?? throw new ArgumentNullException(nameof(service));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        #region Active Requisition Endpoints

        // GET: api/requisition
        [HttpGet]
        [ProducesResponseType(typeof(List<RequisitionForm>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetAll([FromQuery] bool includeDrafts = true)
        {
            try
            {
                var forms = await _service.GetAllAsync(includeDrafts);
                return Ok(forms);
            }
            catch (RequisitionServiceException ex)
            {
                _logger.LogError(ex, "Service error retrieving all requisition forms");
                return StatusCode(500, new ApiErrorResponse
                {
                    Message = "Failed to retrieve requisition forms",
                    Detail = ex.Message,
                    ErrorCode = ex.ErrorCode
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error retrieving all requisition forms");
                return StatusCode(500, new ApiErrorResponse
                {
                    Message = "An unexpected error occurred",
                    Detail = "Please try again later"
                });
            }
        }

        // GET: api/requisition/{id}
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(RequisitionForm), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetById(string id)
        {
            try
            {
                var form = await _service.GetByIdAsync(id);
                if (form == null)
                {
                    return NotFound(new ApiErrorResponse
                    {
                        Message = "Requisition form not found",
                        Detail = $"No requisition form found with ID {id}"
                    });
                }

                return Ok(form);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new ApiErrorResponse
                {
                    Message = "Invalid ID",
                    Detail = ex.Message
                });
            }
            catch (RequisitionServiceException ex)
            {
                _logger.LogError(ex, "Service error retrieving requisition form with ID {Id}", id);
                return StatusCode(500, new ApiErrorResponse
                {
                    Message = "Failed to retrieve requisition form",
                    Detail = ex.Message,
                    ErrorCode = ex.ErrorCode
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error retrieving requisition form with ID {Id}", id);
                return StatusCode(500, new ApiErrorResponse
                {
                    Message = "An unexpected error occurred",
                    Detail = "Please try again later"
                });
            }
        }

        // POST: api/requisition
        [HttpPost]
        [ProducesResponseType(typeof(RequisitionForm), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> Create([FromBody] RequisitionForm form, [FromQuery] string? createdBy = null)
        {
            try
            {
                if (form == null)
                {
                    return BadRequest(new ApiErrorResponse
                    {
                        Message = "Invalid input",
                        Detail = "Requisition form data is required"
                    });
                }

                if (!ModelState.IsValid)
                {
                    return BadRequest(new ApiErrorResponse
                    {
                        Message = "Validation failed",
                        Detail = string.Join(", ", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage))
                    });
                }

                var created = await _service.CreateAsync(form, createdBy);
                return CreatedAtAction(nameof(GetById), new { id = created.RfId }, created);
            }
            catch (ArgumentNullException ex)
            {
                return BadRequest(new ApiErrorResponse
                {
                    Message = "Invalid input",
                    Detail = ex.Message
                });
            }
            catch (ValidationException ex)
            {
                return BadRequest(new ApiErrorResponse
                {
                    Message = "Validation failed",
                    Detail = ex.Message
                });
            }
            catch (RequisitionServiceException ex)
            {
                _logger.LogError(ex, "Service error creating requisition form");
                return StatusCode(500, new ApiErrorResponse
                {
                    Message = "Failed to create requisition form",
                    Detail = ex.Message,
                    ErrorCode = ex.ErrorCode
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error creating requisition form");
                return StatusCode(500, new ApiErrorResponse
                {
                    Message = "An unexpected error occurred",
                    Detail = "Please try again later"
                });
            }
        }

        // PUT: api/requisition/{id}
        [HttpPut("{id}")]
        [ProducesResponseType(typeof(RequisitionForm), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> Update(string id, [FromBody] RequisitionForm form, [FromQuery] string? updatedBy = null)
        {
            try
            {
                if (form == null)
                {
                    return BadRequest(new ApiErrorResponse
                    {
                        Message = "Invalid input",
                        Detail = "Requisition form data is required"
                    });
                }

                if (!ModelState.IsValid)
                {
                    return BadRequest(new ApiErrorResponse
                    {
                        Message = "Validation failed",
                        Detail = string.Join(", ", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage))
                    });
                }

                form.RfId = id; // Ensure ID matches route parameter
                var updated = await _service.UpdateAsync(id, form, updatedBy);

                if (!updated)
                {
                    return NotFound(new ApiErrorResponse
                    {
                        Message = "Requisition form not found",
                        Detail = $"No requisition form found with ID {id} to update"
                    });
                }

                var updatedForm = await _service.GetByIdAsync(id);
                return Ok(updatedForm);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new ApiErrorResponse
                {
                    Message = "Invalid input",
                    Detail = ex.Message
                });
            }
            catch (ValidationException ex)
            {
                return BadRequest(new ApiErrorResponse
                {
                    Message = "Validation failed",
                    Detail = ex.Message
                });
            }
            catch (RequisitionServiceException ex)
            {
                _logger.LogError(ex, "Service error updating requisition form with ID {Id}", id);
                return StatusCode(500, new ApiErrorResponse
                {
                    Message = "Failed to update requisition form",
                    Detail = ex.Message,
                    ErrorCode = ex.ErrorCode
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error updating requisition form with ID {Id}", id);
                return StatusCode(500, new ApiErrorResponse
                {
                    Message = "An unexpected error occurred",
                    Detail = "Please try again later"
                });
            }
        }

        // GET: api/requisition/search
        [HttpGet("search")]
        [ProducesResponseType(typeof(List<RequisitionForm>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> Search(
            [FromQuery] string? department = null,
            [FromQuery] string? requesterName = null,
            [FromQuery] DateTime? dateFrom = null,
            [FromQuery] DateTime? dateTo = null,
            [FromQuery] string? status = null,
            [FromQuery] string? rsNumber = null,
            [FromQuery] string? rfNumber = null)
        {
            try
            {
                var results = await _service.SearchAsync(department, requesterName, dateFrom, dateTo, status, rsNumber, rfNumber);
                return Ok(results);
            }
            catch (RequisitionServiceException ex)
            {
                _logger.LogError(ex, "Service error searching requisition forms");
                return StatusCode(500, new ApiErrorResponse
                {
                    Message = "Failed to search requisition forms",
                    Detail = ex.Message,
                    ErrorCode = ex.ErrorCode
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error searching requisition forms");
                return StatusCode(500, new ApiErrorResponse
                {
                    Message = "An unexpected error occurred",
                    Detail = "Please try again later"
                });
            }
        }

        #endregion

        #region Archive Operations

        // DELETE: api/requisition/{id} (Soft delete - moves to archive)
        [HttpDelete("{id}")]
        [ProducesResponseType(typeof(ApiSuccessResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> SoftDelete(string id, [FromBody] ArchiveRequest? request = null)
        {
            try
            {
                string reason = request?.Reason ?? "Archived via API";
                string archivedBy = request?.ArchivedBy ?? "system";
                string? metadata = request?.AdditionalMetadata;

                var deleted = await _service.SoftDeleteAsync(id, reason, archivedBy, metadata);

                if (!deleted)
                {
                    return NotFound(new ApiErrorResponse
                    {
                        Message = "Requisition form not found",
                        Detail = $"No requisition form found with ID {id} to archive"
                    });
                }

                return Ok(new ApiSuccessResponse
                {
                    Message = "Requisition form archived successfully",
                    Detail = $"Requisition form with ID {id} has been moved to archive"
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new ApiErrorResponse
                {
                    Message = "Invalid input",
                    Detail = ex.Message
                });
            }
            catch (RequisitionServiceException ex)
            {
                _logger.LogError(ex, "Service error archiving requisition form with ID {Id}", id);
                return StatusCode(500, new ApiErrorResponse
                {
                    Message = "Failed to archive requisition form",
                    Detail = ex.Message,
                    ErrorCode = ex.ErrorCode
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error archiving requisition form with ID {Id}", id);
                return StatusCode(500, new ApiErrorResponse
                {
                    Message = "An unexpected error occurred",
                    Detail = "Please try again later"
                });
            }
        }

        // DELETE: api/requisition/bulk (Bulk soft delete)
        [HttpDelete("bulk")]
        [ProducesResponseType(typeof(BulkOperationResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> BulkSoftDelete([FromBody] BulkArchiveRequest request)
        {
            try
            {
                if (request?.Ids == null || !request.Ids.Any())
                {
                    return BadRequest(new ApiErrorResponse
                    {
                        Message = "Invalid input",
                        Detail = "At least one ID is required"
                    });
                }

                string reason = request.Reason ?? "Bulk archive operation";
                string archivedBy = request.ArchivedBy ?? "system";

                var archivedCount = await _service.SoftDeleteBulkAsync(request.Ids, reason, archivedBy);

                return Ok(new BulkOperationResponse
                {
                    TotalRequested = request.Ids.Count,
                    SuccessfulCount = archivedCount,
                    FailedCount = request.Ids.Count - archivedCount,
                    Message = $"Bulk archive completed: {archivedCount} of {request.Ids.Count} forms archived"
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new ApiErrorResponse
                {
                    Message = "Invalid input",
                    Detail = ex.Message
                });
            }
            catch (RequisitionServiceException ex)
            {
                _logger.LogError(ex, "Service error during bulk archive operation");
                return StatusCode(500, new ApiErrorResponse
                {
                    Message = "Failed to perform bulk archive",
                    Detail = ex.Message,
                    ErrorCode = ex.ErrorCode
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error during bulk archive operation");
                return StatusCode(500, new ApiErrorResponse
                {
                    Message = "An unexpected error occurred",
                    Detail = "Please try again later"
                });
            }
        }

        // POST: api/requisition/restore/{id}
        [HttpPost("restore/{id}")]
        [ProducesResponseType(typeof(ApiSuccessResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> Restore(string id, [FromQuery] string? restoredBy = null)
        {
            try
            {
                var restored = await _service.RestoreAsync(id, restoredBy ?? "system");

                if (!restored)
                {
                    return NotFound(new ApiErrorResponse
                    {
                        Message = "Archived form not found or not restorable",
                        Detail = $"No restorable archived form found with ID {id}"
                    });
                }

                return Ok(new ApiSuccessResponse
                {
                    Message = "Requisition form restored successfully",
                    Detail = $"Archived form with ID {id} has been restored to active status"
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new ApiErrorResponse
                {
                    Message = "Invalid input",
                    Detail = ex.Message
                });
            }
            catch (RequisitionServiceException ex)
            {
                _logger.LogError(ex, "Service error restoring requisition form with ID {Id}", id);
                return StatusCode(500, new ApiErrorResponse
                {
                    Message = "Failed to restore requisition form",
                    Detail = ex.Message,
                    ErrorCode = ex.ErrorCode
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error restoring requisition form with ID {Id}", id);
                return StatusCode(500, new ApiErrorResponse
                {
                    Message = "An unexpected error occurred",
                    Detail = "Please try again later"
                });
            }
        }

        #endregion

        #region Archive Retrieval Endpoints

        // GET: api/requisition/archive
        [HttpGet("archive")]
        [ProducesResponseType(typeof(List<RequisitionArchive>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetAllArchived([FromQuery] bool includeExpired = false)
        {
            try
            {
                var archivedForms = await _service.GetAllArchivedAsync(includeExpired);
                return Ok(archivedForms);
            }
            catch (RequisitionServiceException ex)
            {
                _logger.LogError(ex, "Service error retrieving archived requisition forms");
                return StatusCode(500, new ApiErrorResponse
                {
                    Message = "Failed to retrieve archived forms",
                    Detail = ex.Message,
                    ErrorCode = ex.ErrorCode
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error retrieving archived requisition forms");
                return StatusCode(500, new ApiErrorResponse
                {
                    Message = "An unexpected error occurred",
                    Detail = "Please try again later"
                });
            }
        }

        // GET: api/requisition/archive/{id}
        [HttpGet("archive/{id}")]
        [ProducesResponseType(typeof(RequisitionArchive), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetArchivedById(string id)
        {
            try
            {
                var archivedForm = await _service.GetArchivedByIdAsync(id);

                if (archivedForm == null)
                {
                    return NotFound(new ApiErrorResponse
                    {
                        Message = "Archived requisition form not found",
                        Detail = $"No archived requisition form found with ID {id}"
                    });
                }

                return Ok(archivedForm);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new ApiErrorResponse
                {
                    Message = "Invalid input",
                    Detail = ex.Message
                });
            }
            catch (RequisitionServiceException ex)
            {
                _logger.LogError(ex, "Service error retrieving archived requisition form with ID {Id}", id);
                return StatusCode(500, new ApiErrorResponse
                {
                    Message = "Failed to retrieve archived form",
                    Detail = ex.Message,
                    ErrorCode = ex.ErrorCode
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error retrieving archived requisition form with ID {Id}", id);
                return StatusCode(500, new ApiErrorResponse
                {
                    Message = "An unexpected error occurred",
                    Detail = "Please try again later"
                });
            }
        }

        // GET: api/requisition/archive/search
        [HttpGet("archive/search")]
        [ProducesResponseType(typeof(List<RequisitionArchive>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> SearchArchived(
            [FromQuery] DateTime? dateFrom = null,
            [FromQuery] DateTime? dateTo = null,
            [FromQuery] DateTime? archivedFrom = null,
            [FromQuery] DateTime? archivedTo = null,
            [FromQuery] string? keyword = null,
            [FromQuery] string? archivedBy = null,
            [FromQuery] string? department = null)
        {
            try
            {
                var results = await _service.SearchArchivedAsync(
                    dateFrom, dateTo, archivedFrom, archivedTo, keyword, archivedBy, department);
                return Ok(results);
            }
            catch (RequisitionServiceException ex)
            {
                _logger.LogError(ex, "Service error searching archived requisition forms");
                return StatusCode(500, new ApiErrorResponse
                {
                    Message = "Failed to search archived forms",
                    Detail = ex.Message,
                    ErrorCode = ex.ErrorCode
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error searching archived requisition forms");
                return StatusCode(500, new ApiErrorResponse
                {
                    Message = "An unexpected error occurred",
                    Detail = "Please try again later"
                });
            }
        }

        // DELETE: api/requisition/archive/{id} (Hard delete - permanent)
        [HttpDelete("archive/{id}")]
        [ProducesResponseType(typeof(ApiSuccessResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> HardDelete(string id)
        {
            try
            {
                var deleted = await _service.HardDeleteAsync(id);

                if (!deleted)
                {
                    return NotFound(new ApiErrorResponse
                    {
                        Message = "Archived requisition form not found",
                        Detail = $"No archived requisition form found with ID {id} to delete permanently"
                    });
                }

                return Ok(new ApiSuccessResponse
                {
                    Message = "Archived requisition form deleted permanently",
                    Detail = $"Archived requisition form with ID {id} has been permanently deleted"
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new ApiErrorResponse
                {
                    Message = "Invalid input",
                    Detail = ex.Message
                });
            }
            catch (RequisitionServiceException ex)
            {
                _logger.LogError(ex, "Service error permanently deleting archived requisition form with ID {Id}", id);
                return StatusCode(500, new ApiErrorResponse
                {
                    Message = "Failed to permanently delete archived form",
                    Detail = ex.Message,
                    ErrorCode = ex.ErrorCode
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error permanently deleting archived requisition form with ID {Id}", id);
                return StatusCode(500, new ApiErrorResponse
                {
                    Message = "An unexpected error occurred",
                    Detail = "Please try again later"
                });
            }
        }

        #endregion

        #region Maintenance Operations

        // POST: api/requisition/maintenance/cleanup
        [HttpPost("maintenance/cleanup")]
        [ProducesResponseType(typeof(MaintenanceResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> CleanupExpiredArchives([FromQuery] bool dryRun = true)
        {
            try
            {
                var cleanedCount = await _service.CleanupExpiredArchivesAsync(dryRun);

                return Ok(new MaintenanceResponse
                {
                    Operation = "Cleanup Expired Archives",
                    Count = cleanedCount,
                    DryRun = dryRun,
                    Message = dryRun
                        ? $"Found {cleanedCount} expired records (dry run)"
                        : $"Cleaned up {cleanedCount} expired records"
                });
            }
            catch (RequisitionServiceException ex)
            {
                _logger.LogError(ex, "Service error during cleanup operation");
                return StatusCode(500, new ApiErrorResponse
                {
                    Message = "Failed to cleanup expired archives",
                    Detail = ex.Message,
                    ErrorCode = ex.ErrorCode
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error during cleanup operation");
                return StatusCode(500, new ApiErrorResponse
                {
                    Message = "An unexpected error occurred",
                    Detail = "Please try again later"
                });
            }
        }

        // GET: api/requisition/statistics
        [HttpGet("statistics")]
        [ProducesResponseType(typeof(Dictionary<string, object>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetStatistics()
        {
            try
            {
                var stats = await _service.GetStatisticsAsync();
                return Ok(stats);
            }
            catch (RequisitionServiceException ex)
            {
                _logger.LogError(ex, "Service error generating statistics");
                return StatusCode(500, new ApiErrorResponse
                {
                    Message = "Failed to generate statistics",
                    Detail = ex.Message,
                    ErrorCode = ex.ErrorCode
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error generating statistics");
                return StatusCode(500, new ApiErrorResponse
                {
                    Message = "An unexpected error occurred",
                    Detail = "Please try again later"
                });
            }
        }

        // GET: api/requisition/{id}/validate
        [HttpGet("{id}/validate")]
        [ProducesResponseType(typeof(ValidationResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> ValidateWorkflow(string id)
        {
            try
            {
                var errors = await _service.ValidateWorkflowIntegrityAsync(id);

                return Ok(new ValidationResponse
                {
                    FormId = id,
                    IsValid = !errors.Any(),
                    Errors = errors,
                    Message = errors.Any()
                        ? $"Found {errors.Count} validation error(s)"
                        : "Workflow validation passed"
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new ApiErrorResponse
                {
                    Message = "Invalid input",
                    Detail = ex.Message
                });
            }
            catch (RequisitionServiceException ex)
            {
                _logger.LogError(ex, "Service error validating workflow for ID {Id}", id);
                return StatusCode(500, new ApiErrorResponse
                {
                    Message = "Failed to validate workflow",
                    Detail = ex.Message,
                    ErrorCode = ex.ErrorCode
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error validating workflow for ID {Id}", id);
                return StatusCode(500, new ApiErrorResponse
                {
                    Message = "An unexpected error occurred",
                    Detail = "Please try again later"
                });
            }
        }

        #endregion
    }

    #region Response DTOs

    public class ApiErrorResponse
    {
        public string Message { get; set; } = string.Empty;
        public string Detail { get; set; } = string.Empty;
        public string? ErrorCode { get; set; }
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }

    public class ApiSuccessResponse
    {
        public string Message { get; set; } = string.Empty;
        public string Detail { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }

    public class ArchiveRequest
    {
        public string? Reason { get; set; }
        public string? ArchivedBy { get; set; }
        public string? AdditionalMetadata { get; set; }
    }

    public class BulkArchiveRequest
    {
        public List<string> Ids { get; set; } = new();
        public string? Reason { get; set; }
        public string? ArchivedBy { get; set; }
    }

    public class BulkOperationResponse
    {
        public int TotalRequested { get; set; }
        public int SuccessfulCount { get; set; }
        public int FailedCount { get; set; }
        public string Message { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }

    public class MaintenanceResponse
    {
        public string Operation { get; set; } = string.Empty;
        public int Count { get; set; }
        public bool DryRun { get; set; }
        public string Message { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }

    public class ValidationResponse
    {
        public string FormId { get; set; } = string.Empty;
        public bool IsValid { get; set; }
        public List<string> Errors { get; set; } = new();
        public string Message { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }

    #endregion
}

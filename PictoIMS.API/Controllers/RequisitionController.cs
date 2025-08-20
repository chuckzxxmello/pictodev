using Microsoft.AspNetCore.Mvc;
using PictoIMS.API.Models;
using PictoIMS.API.Services;
using System;
using System.Collections.Generic;
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
            _service = service;
            _logger = logger;
        }

        // if the systems has bugs, throw this error
        [HttpGet]
        [ProducesResponseType(typeof(List<RequisitionForm>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status500InternalServerError)]

        // method handler for checking if database if active or not and getting the data
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var forms = await _service.GetAllAsync();
                return Ok(forms);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving all requisition forms");
                return StatusCode(500, new ApiErrorResponse
                {
                    Message = "An error occurred while retrieving requisition forms",
                    Detail = ex.Message
                });
            }
        }

        // method to display api status codes
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(RequisitionForm), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetById(string id)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(id))
                    return BadRequest(new ApiErrorResponse { Message = "Invalid ID", Detail = "ID must be a non-empty string" });

                var form = await _service.GetByIdAsync(id);
                if (form == null)
                    return NotFound(new ApiErrorResponse { Message = "Requisition form not found", Detail = $"No requisition form found with ID {id}" });

                return Ok(form);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving requisition form with ID {Id}", id);
                return StatusCode(500, new ApiErrorResponse
                {
                    Message = "An error occurred while retrieving the requisition form",
                    Detail = ex.Message
                });
            }
        }

        // Create a new requisition form
        [HttpPost]
        [ProducesResponseType(typeof(RequisitionForm), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> Post([FromBody] RequisitionForm form)
        {
            try
            {
                if (form == null)
                    return BadRequest(new ApiErrorResponse { Message = "Invalid input", Detail = "Requisition form data is required" });

                if (!ModelState.IsValid)
                    return BadRequest(new ApiErrorResponse
                    {
                        Message = "Validation failed",
                        Detail = string.Join(", ", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage))
                    });

                var created = await _service.CreateAsync(form);
                return CreatedAtAction(nameof(GetById), new { id = created.RfId }, created);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating requisition form");
                return StatusCode(500, new ApiErrorResponse
                {
                    Message = "An error occurred while creating the requisition form",
                    Detail = ex.Message
                });
            }
        }

        // Update an existing requisition form
        [HttpPut("{id}")]
        [ProducesResponseType(typeof(RequisitionForm), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> Put(string id, [FromBody] RequisitionForm form)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(id))
                    return BadRequest(new ApiErrorResponse { Message = "Invalid ID", Detail = "ID must be a non-empty string" });

                if (form == null)
                    return BadRequest(new ApiErrorResponse { Message = "Invalid input", Detail = "Requisition form data is required" });

                if (!ModelState.IsValid)
                    return BadRequest(new ApiErrorResponse
                    {
                        Message = "Validation failed",
                        Detail = string.Join(", ", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage))
                    });

                form.RfId = id; // match route ID
                var updated = await _service.UpdateAsync(id, form);
                if (!updated)
                    return NotFound(new ApiErrorResponse { Message = "Requisition data not found", Detail = $"No requisition form found with ID {id} to update" });

                return Ok(await _service.GetByIdAsync(id));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating requisition form with ID {Id}", id);
                return StatusCode(500, new ApiErrorResponse
                {
                    Message = "An error occurred while updating the requisition form",
                    Detail = ex.Message
                });
            }
        }

        // Soft delete a requisition form (moves to archive)
        [HttpDelete("{id}")]
        [ProducesResponseType(typeof(ApiSuccessResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> Delete(string id, [FromBody] ArchiveRequest? request)
        {
            string reason = request?.Reason ?? "Archived via API";
            string archivedBy = request?.ArchivedBy ?? "system";

            try
            {
                if (string.IsNullOrWhiteSpace(id))
                    return BadRequest(new ApiErrorResponse { Message = "Invalid ID", Detail = "ID must be a non-empty string" });

                var deleted = await _service.SoftDeleteAsync(id, reason, archivedBy);
                if (!deleted)
                    return NotFound(new ApiErrorResponse { Message = "Requisition form not found", Detail = $"No requisition form found with ID {id} to archive" });

                return Ok(new ApiSuccessResponse
                {
                    Message = "Requisition form archived successfully",
                    Detail = $"Requisition form with ID {id} has been moved to archive"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error archiving requisition form with ID {Id}", id);
                return StatusCode(500, new ApiErrorResponse
                {
                    Message = "An error occurred while archiving the requisition form",
                    Detail = ex.Message
                });
            }
        }

        // Permanently HARD delete an archived requisition form
        [HttpDelete("archive/{id}")]
        [ProducesResponseType(typeof(ApiSuccessResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> DeleteArchived(string id)   // <-- string now
        {
            try
            {
                if (string.IsNullOrWhiteSpace(id))
                    return BadRequest(new ApiErrorResponse { Message = "Invalid ID", Detail = "ID must be a non-empty string" });

                var deleted = await _service.HardDeleteAsync(id);
                if (!deleted)
                    return NotFound(new ApiErrorResponse { Message = "Archived requisition form not found", Detail = $"No archived requisition form found with ID {id} to delete permanently" });

                return Ok(new ApiSuccessResponse
                {
                    Message = "Archived requisition form deleted permanently",
                    Detail = $"Archived requisition form with ID {id} has been permanently deleted"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error permanently deleting archived requisition form with ID {Id}", id);
                return StatusCode(500, new ApiErrorResponse
                {
                    Message = "An error occurred while permanently deleting the archived requisition form",
                    Detail = ex.Message
                });
            }
        }
        // Get all archived requisition forms
        [HttpGet("archive")]
        [ProducesResponseType(typeof(List<RequisitionArchive>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetAllArchived()
        {
            try
            {
                var archivedForms = await _service.GetAllArchivedAsync();
                return Ok(await _service.GetAllArchivedAsync());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving archived requisition forms");
                return StatusCode(500, new ApiErrorResponse
                {
                    Message = "An error occurred while retrieving archived requisition forms",
                    Detail = ex.Message
                });
            }
        }

        [HttpDelete("bulk")]
        [ProducesResponseType(typeof(ApiSuccessResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> DeleteBulk([FromBody] List<string> ids)
        {
            if (ids == null || !ids.Any())
                return BadRequest(new ApiErrorResponse { Message = "Invalid input", Detail = "At least one ID is required" });

            try
            {
                int deletedCount = 0;
                foreach (var id in ids)
                {
                    var deleted = await _service.SoftDeleteAsync(id, "Bulk delete", "system");
                    if (deleted) deletedCount++;
                }

                return Ok(new ApiSuccessResponse
                {
                    Message = "Bulk delete completed",
                    Detail = $"{deletedCount} out of {ids.Count} requisition(s) archived successfully"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during bulk delete");
                return StatusCode(500, new ApiErrorResponse
                {
                    Message = "An error occurred while bulk deleting requisition forms",
                    Detail = ex.Message
                });
            }
        }

        // Get a specific archived requisition form by ID
        [HttpGet("archive/{id}")]
        [ProducesResponseType(typeof(RequisitionArchive), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetArchivedById(string id)   // <-- string now
        {
            try
            {
                if (string.IsNullOrWhiteSpace(id))
                    return BadRequest(new ApiErrorResponse { Message = "Invalid ID", Detail = "ID must be a non-empty string" });

                var archivedForm = await _service.GetArchivedByIdAsync(id);
                if (archivedForm == null)
                    return NotFound(new ApiErrorResponse { Message = "Archived requisition form not found", Detail = $"No archived requisition form found with ID {id}" });

                return Ok(archivedForm);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving archived requisition form with ID {Id}", id);
                return StatusCode(500, new ApiErrorResponse
                {
                    Message = "An error occurred while retrieving the archived requisition form",
                    Detail = ex.Message
                });
            }
        }
    }

    public class ApiErrorResponse
    {
        public string Message { get; set; } = string.Empty;
        public string Detail { get; set; } = string.Empty;
    }

    public class ApiSuccessResponse
    {
        public string Message { get; set; } = string.Empty;
        public string Detail { get; set; } = string.Empty;
    }

    public class ArchiveRequest
    {
        public string? Reason { get; set; }
        public string? ArchivedBy { get; set; }
    }
}

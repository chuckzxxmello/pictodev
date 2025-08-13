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

        /// <summary>
        /// Get all requisition forms
        /// </summary>
        [HttpGet]
        [ProducesResponseType(typeof(List<RequisitionForm>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status500InternalServerError)]
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

        /// <summary>
        /// Get a specific requisition form by ID
        /// </summary>
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(RequisitionForm), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                if (id <= 0)
                    return BadRequest(new ApiErrorResponse { Message = "Invalid ID", Detail = "ID must be greater than 0" });

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

        /// <summary>
        /// Create a new requisition form
        /// </summary>
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

        /// <summary>
        /// Update an existing requisition form
        /// </summary>
        [HttpPut("{id}")]
        [ProducesResponseType(typeof(RequisitionForm), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> Put(int id, [FromBody] RequisitionForm form)
        {
            try
            {
                if (id <= 0)
                    return BadRequest(new ApiErrorResponse { Message = "Invalid ID", Detail = "ID must be greater than 0" });

                if (form == null)
                    return BadRequest(new ApiErrorResponse { Message = "Invalid input", Detail = "Requisition form data is required" });

                if (!ModelState.IsValid)
                    return BadRequest(new ApiErrorResponse
                    {
                        Message = "Validation failed",
                        Detail = string.Join(", ", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage))
                    });

                form.RfId = id; // Ensure the ID matches
                var updated = await _service.UpdateAsync(id, form);
                if (!updated)
                    return NotFound(new ApiErrorResponse { Message = "Requisition form not found", Detail = $"No requisition form found with ID {id} to update" });

                var updatedForm = await _service.GetByIdAsync(id);
                return Ok(updatedForm);
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

        /// <summary>
        /// Soft delete a requisition form (moves to archive)
        /// </summary>
        [HttpDelete("{id}")]
        [ProducesResponseType(typeof(ApiSuccessResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                if (id <= 0)
                    return BadRequest(new ApiErrorResponse { Message = "Invalid ID", Detail = "ID must be greater than 0" });

                var deleted = await _service.SoftDeleteAsync(id);
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

        /// <summary>
        /// Permanently delete an archived requisition form
        /// </summary>
        [HttpDelete("archive/{id}")]
        [ProducesResponseType(typeof(ApiSuccessResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> DeleteArchived(int id)
        {
            try
            {
                if (id <= 0)
                    return BadRequest(new ApiErrorResponse { Message = "Invalid ID", Detail = "ID must be greater than 0" });

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

        /// <summary>
        /// Get all archived requisition forms
        /// </summary>
        [HttpGet("archive")]
        [ProducesResponseType(typeof(List<RequisitionArchive>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetAllArchived()
        {
            try
            {
                var archivedForms = await _service.GetAllArchivedAsync();
                return Ok(archivedForms);
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

        /// <summary>
        /// Get a specific archived requisition form by ID
        /// </summary>
        [HttpGet("archive/{id}")]
        [ProducesResponseType(typeof(RequisitionArchive), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ApiErrorResponse), StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetArchivedById(int id)
        {
            try
            {
                if (id <= 0)
                    return BadRequest(new ApiErrorResponse { Message = "Invalid ID", Detail = "ID must be greater than 0" });

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
}

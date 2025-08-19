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
    public class InventoryController : ControllerBase
    {
        private readonly IInventoryService _service;
        private readonly ILogger<InventoryController> _logger;

        public InventoryController(IInventoryService service, ILogger<InventoryController> logger)
        {
            _service = service;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var items = await _service.GetAllAsync();
                return Ok(items);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving inventory");
                return StatusCode(500, new ApiErrorResponse { Message = "Failed to fetch inventory", Detail = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var item = await _service.GetByIdAsync(id);
                if (item == null)
                    return NotFound(new ApiErrorResponse { Message = "Item not found", Detail = $"No inventory item with ID {id}" });
                return Ok(item);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving inventory item {Id}", id);
                return StatusCode(500, new ApiErrorResponse { Message = "Error retrieving item", Detail = ex.Message });
            }
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] PictoInventory inventory)
        {
            try
            {
                var created = await _service.CreateAsync(inventory);
                return CreatedAtAction(nameof(GetById), new { id = created.ItemId }, created);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating inventory");
                return StatusCode(500, new ApiErrorResponse { Message = "Error creating inventory", Detail = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] PictoInventory inventory)
        {
            try
            {
                var updated = await _service.UpdateAsync(id, inventory);
                if (!updated)
                    return NotFound(new ApiErrorResponse { Message = "Item not found", Detail = $"No inventory item with ID {id}" });
                return Ok(new ApiSuccessResponse { Message = "Item updated", Detail = $"Item {id} updated successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating inventory {Id}", id);
                return StatusCode(500, new ApiErrorResponse { Message = "Error updating item", Detail = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> SoftDelete(int id, [FromQuery] string? reason = null, [FromQuery] string? archivedBy = null)
        {
            try
            {
                var deleted = await _service.SoftDeleteAsync(id, reason, archivedBy);
                if (!deleted)
                    return NotFound(new ApiErrorResponse { Message = "Item not found", Detail = $"No inventory item with ID {id}" });
                return Ok(new ApiSuccessResponse { Message = "Item archived", Detail = $"Item {id} moved to archive" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error archiving inventory {Id}", id);
                return StatusCode(500, new ApiErrorResponse { Message = "Error archiving item", Detail = ex.Message });
            }
        }

        [HttpDelete("archive/{id}")]
        public async Task<IActionResult> HardDelete(int id)
        {
            try
            {
                var deleted = await _service.HardDeleteAsync(id);
                if (!deleted)
                    return NotFound(new ApiErrorResponse { Message = "Archived item not found", Detail = $"No archive record with ID {id}" });
                return Ok(new ApiSuccessResponse { Message = "Archived item deleted", Detail = $"Archive {id} deleted permanently" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting archived item {Id}", id);
                return StatusCode(500, new ApiErrorResponse { Message = "Error deleting archived item", Detail = ex.Message });
            }
        }

        [HttpGet("archive")]
        public async Task<IActionResult> GetAllArchived()
        {
            try
            {
                var archived = await _service.GetAllArchivedAsync();
                return Ok(archived);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching archived items");
                return StatusCode(500, new ApiErrorResponse { Message = "Error fetching archive", Detail = ex.Message });
            }
        }

        [HttpGet("archive/{id}")]
        public async Task<IActionResult> GetArchivedById(int id)
        {
            try
            {
                var archived = await _service.GetArchivedByIdAsync(id);
                if (archived == null)
                    return NotFound(new ApiErrorResponse { Message = "Archived item not found", Detail = $"No archived item with ID {id}" });
                return Ok(archived);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching archived item {Id}", id);
                return StatusCode(500, new ApiErrorResponse { Message = "Error fetching archived item", Detail = ex.Message });
            }
        }
    }
}

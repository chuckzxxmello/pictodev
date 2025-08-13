using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PictoIMS.API.Data;
using PictoIMS.API.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PictoIMS.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class InventoryController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public InventoryController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<PictoInventory>>> GetAll()
        {
            return await _context.PictoInventories.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<PictoInventory>> GetById(int id)
        {
            var item = await _context.PictoInventories.FindAsync(id);
            if (item == null) return NotFound();
            return item;
        }

        [HttpPost]
        public async Task<ActionResult<PictoInventory>> Create(PictoInventory inventory)
        {
            inventory.ItemId = 0; // EF will generate new PK
            inventory.DateAdded = inventory.DateAdded.ToUniversalTime();

            _context.PictoInventories.Add(inventory);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = inventory.ItemId }, inventory);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, PictoInventory inventory)
        {
            if (id != inventory.ItemId)
                return BadRequest("ID in path and body must match.");

            var existing = await _context.PictoInventories.FindAsync(id);
            if (existing == null) return NotFound();

            existing.ItemName = inventory.ItemName;
            existing.Description = inventory.Description;
            existing.Quantity = inventory.Quantity;
            existing.Category = inventory.Category;
            existing.Unit = inventory.Unit;
            existing.Location = inventory.Location;
            existing.Status = inventory.Status;
            existing.DateAdded = inventory.DateAdded.ToUniversalTime();

            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var inventory = await _context.PictoInventories.FindAsync(id);
            if (inventory == null) return NotFound();

            _context.PictoInventories.Remove(inventory);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpGet("{id}/history")]
        public async Task<ActionResult<IEnumerable<InventoryTrackingHistory>>> GetHistory(int id)
        {
            var item = await _context.PictoInventories.FindAsync(id);
            if (item == null) return NotFound();

            var history = await _context.InventoryTrackingHistories
                .Where(h => h.ItemId == id)
                .ToListAsync();

            return history;
        }
    }
}
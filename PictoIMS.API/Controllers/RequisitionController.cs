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
    public class RequisitionController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public RequisitionController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/requisition
        [HttpGet]
        public async Task<ActionResult<IEnumerable<RequisitionForm>>> GetRequisitionForms()
        {
            // Return only non-archived forms
            var forms = await _context.RequisitionForms
                .Where(r => !r.IsArchived)
                .ToListAsync();
            return Ok(forms);
        }

        // POST: api/requisition
        [HttpPost]
        public async Task<ActionResult<RequisitionForm>> CreateRequisitionForm(RequisitionForm form)
        {
            _context.RequisitionForms.Add(form);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetRequisitionFormById), new { id = form.RfId }, form);
        }

        // GET: api/requisition/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<RequisitionForm>> GetRequisitionFormById(int id)
        {
            var form = await _context.RequisitionForms.FindAsync(id);
            if (form == null || form.IsArchived)
                return NotFound();

            return Ok(form);
        }

        // PUT: api/requisition/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateRequisitionForm(int id, RequisitionForm updatedForm)
        {
            if (id != updatedForm.RfId)
                return BadRequest();

            var form = await _context.RequisitionForms.FindAsync(id);
            if (form == null || form.IsArchived)
                return NotFound();

            // Update fields (you can also use AutoMapper or manually update each property)
            form.RequesterName = updatedForm.RequesterName;
            form.RequesterPosition = updatedForm.RequesterPosition;
            form.Department = updatedForm.Department;
            form.Purpose = updatedForm.Purpose;
            form.DateRequested = updatedForm.DateRequested;
            form.CheckedByName = updatedForm.CheckedByName;
            form.CheckedByPosition = updatedForm.CheckedByPosition;
            form.CheckedByDate = updatedForm.CheckedByDate;
            form.ApprovedByName = updatedForm.ApprovedByName;
            form.ApprovedByPosition = updatedForm.ApprovedByPosition;
            form.ApprovedByDate = updatedForm.ApprovedByDate;
            form.IssuedByName = updatedForm.IssuedByName;
            form.IssuedByPosition = updatedForm.IssuedByPosition;
            form.IssuedByDate = updatedForm.IssuedByDate;
            form.ReceivedByName = updatedForm.ReceivedByName;
            form.ReceivedByPosition = updatedForm.ReceivedByPosition;
            form.ReceivedByDate = updatedForm.ReceivedByDate;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE (soft delete/archive): api/requisition/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> ArchiveRequisitionForm(int id)
        {
            var form = await _context.RequisitionForms.FindAsync(id);
            if (form == null || form.IsArchived)
                return NotFound();

            form.IsArchived = true;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // Optional: Hard delete from archive (you can implement this in a separate controller/action)
        [HttpDelete("hard-delete/{id}")]
        public async Task<IActionResult> HardDeleteRequisitionForm(int id)
        {
            var form = await _context.RequisitionForms.FindAsync(id);
            if (form == null)
                return NotFound();

            if (!form.IsArchived)
                return BadRequest("Cannot hard delete a non-archived record.");

            _context.RequisitionForms.Remove(form);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
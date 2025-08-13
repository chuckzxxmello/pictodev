using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PictoIMS.API.Data;
using PictoIMS.API.Models;
using System.Text.RegularExpressions;

namespace PictoIMS.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public UsersController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/users
        [HttpGet]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<User>>> GetUsers()
        {
            return await _context.Users.ToListAsync();
        }

        // GET: api/users/{id}
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<ActionResult<User>> GetUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound();
            return user;
        }

        // POST: api/users
        [HttpPost]
        [AllowAnonymous]
        public async Task<ActionResult<User>> CreateUser(User user)
        {
            if (user == null)
                return BadRequest("User cannot be null.");

            // Validate role
            var allowedRoles = new[] { "Admin", "Manager", "User" };
            if (!allowedRoles.Contains(user.Role))
                return BadRequest($"Invalid role. Allowed roles: {string.Join(", ", allowedRoles)}");

            // Validate password hash format (example: BCrypt hash)
            if (string.IsNullOrWhiteSpace(user.PasswordHash) || !Regex.IsMatch(user.PasswordHash, @"^\$2[abxy]\$\d{2}\$[./A-Za-z0-9]{53}$"))
                return BadRequest("Invalid password hash format. Must be a valid BCrypt hash.");

            try
            {
                user.DateCreated = DateTime.UtcNow;
                _context.Users.Add(user);
                await _context.SaveChangesAsync();
                return CreatedAtAction(nameof(GetUser), new { id = user.UserId }, user);
            }
            catch (DbUpdateException ex)
            {
                if (ex.InnerException != null && ex.InnerException.Message.Contains("users_role_check"))
                    return BadRequest("Role is invalid according to database constraint.");

                return StatusCode(500, $"Database error: {ex.Message}");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Unexpected error: {ex.Message}");
            }
        }

        // PUT: api/users/{id}
        [HttpPut("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> UpdateUser(int id, User updatedUser)
        {
            if (id != updatedUser.UserId) return BadRequest();

            var existingUser = await _context.Users.FindAsync(id);
            if (existingUser == null) return NotFound();

            // Validate role
            var allowedRoles = new[] { "Admin", "Manager", "User" };
            if (!allowedRoles.Contains(updatedUser.Role))
                return BadRequest($"Invalid role. Allowed roles: {string.Join(", ", allowedRoles)}");

            // Validate password hash format
            if (string.IsNullOrWhiteSpace(updatedUser.PasswordHash) || !Regex.IsMatch(updatedUser.PasswordHash, @"^\$2[abxy]\$\d{2}\$[./A-Za-z0-9]{53}$"))
                return BadRequest("Invalid password hash format. Must be a valid BCrypt hash.");

            existingUser.Username = updatedUser.Username;
            existingUser.PasswordHash = updatedUser.PasswordHash;
            existingUser.FullName = updatedUser.FullName;
            existingUser.Role = updatedUser.Role;
            existingUser.Email = updatedUser.Email;
            existingUser.Phone = updatedUser.Phone;
            existingUser.DateCreated = updatedUser.DateCreated;

            try
            {
                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (DbUpdateException ex)
            {
                if (ex.InnerException != null && ex.InnerException.Message.Contains("users_role_check"))
                    return BadRequest("Role is invalid according to database constraint.");

                return StatusCode(500, $"Database error: {ex.Message}");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Unexpected error: {ex.Message}");
            }
        }

        // DELETE: api/users/{id}
        [HttpDelete("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound();

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
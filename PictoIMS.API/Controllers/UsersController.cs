using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PictoIMS.API.Services;
using PictoIMS.API.Models;

namespace PictoIMS.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly ILogger<UsersController> _logger;

        public UsersController(IUserService userService, ILogger<UsersController> logger)
        {
            _userService = userService;
            _logger = logger;
        }

        // GET: api/users
        [HttpGet]
        [AllowAnonymous] // Remove this in production and add proper authorization
        public async Task<ActionResult<IEnumerable<UserResponseDto>>> GetUsers()
        {
            try
            {
                var users = await _userService.GetAllUsersAsync();
                var userDtos = users.Select(u => new UserResponseDto
                {
                    UserId = u.UserId,
                    Username = u.Username,
                    FullName = u.FullName,
                    Role = u.Role,
                    Email = u.Email,
                    Phone = u.Phone,
                    DateCreated = u.DateCreated
                }).ToList();

                return Ok(userDtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving users");
                return StatusCode(500, "An error occurred while retrieving users");
            }
        }

        // GET: api/users/{id}
        [HttpGet("{id}")]
        [AllowAnonymous] // Remove this in production and add proper authorization
        public async Task<ActionResult<UserResponseDto>> GetUser(int id)
        {
            try
            {
                var user = await _userService.GetUserByIdAsync(id);
                if (user == null)
                    return NotFound($"User with ID {id} not found");

                var userDto = new UserResponseDto
                {
                    UserId = user.UserId,
                    Username = user.Username,
                    FullName = user.FullName,
                    Role = user.Role,
                    Email = user.Email,
                    Phone = user.Phone,
                    DateCreated = user.DateCreated
                };

                return Ok(userDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user with ID: {UserId}", id);
                return StatusCode(500, "An error occurred while retrieving the user");
            }
        }

        // POST: api/users
        [HttpPost]
        [AllowAnonymous] // Remove this in production and add proper authorization
        public async Task<ActionResult<UserResponseDto>> CreateUser(CreateUserDto createUserDto)
        {
            try
            {
                if (createUserDto == null)
                    return BadRequest("User data cannot be null");

                // Basic validation
                if (string.IsNullOrWhiteSpace(createUserDto.Username))
                    return BadRequest("Username is required");

                if (string.IsNullOrWhiteSpace(createUserDto.Password))
                    return BadRequest("Password is required");

                if (createUserDto.Password.Length < 6)
                    return BadRequest("Password must be at least 6 characters long");

                if (string.IsNullOrWhiteSpace(createUserDto.FullName))
                    return BadRequest("Full name is required");

                if (string.IsNullOrWhiteSpace(createUserDto.Role))
                    return BadRequest("Role is required");

                // Email validation (if provided)
                if (!string.IsNullOrWhiteSpace(createUserDto.Email) &&
                    !IsValidEmail(createUserDto.Email))
                    return BadRequest("Invalid email format");

                var createdUser = await _userService.CreateUserAsync(createUserDto);

                var userDto = new UserResponseDto
                {
                    UserId = createdUser.UserId,
                    Username = createdUser.Username,
                    FullName = createdUser.FullName,
                    Role = createdUser.Role,
                    Email = createdUser.Email,
                    Phone = createdUser.Phone,
                    DateCreated = createdUser.DateCreated
                };

                return CreatedAtAction(nameof(GetUser), new { id = createdUser.UserId }, userDto);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating user");
                return StatusCode(500, "An error occurred while creating the user");
            }
        }

        // PUT: api/users/{id}
        [HttpPut("{id}")]
        [AllowAnonymous] // Remove this in production and add proper authorization
        public async Task<ActionResult<UserResponseDto>> UpdateUser(int id, UpdateUserDto updateUserDto)
        {
            try
            {
                if (updateUserDto == null)
                    return BadRequest("User data cannot be null");

                // Email validation (if provided)
                if (!string.IsNullOrWhiteSpace(updateUserDto.Email) &&
                    !IsValidEmail(updateUserDto.Email))
                    return BadRequest("Invalid email format");

                // Password validation (if changing)
                if (!string.IsNullOrWhiteSpace(updateUserDto.Password) &&
                    updateUserDto.Password.Length < 6)
                    return BadRequest("Password must be at least 6 characters long");

                var updatedUser = await _userService.UpdateUserAsync(id, updateUserDto);
                if (updatedUser == null)
                    return NotFound($"User with ID {id} not found");

                var userDto = new UserResponseDto
                {
                    UserId = updatedUser.UserId,
                    Username = updatedUser.Username,
                    FullName = updatedUser.FullName,
                    Role = updatedUser.Role,
                    Email = updatedUser.Email,
                    Phone = updatedUser.Phone,
                    DateCreated = updatedUser.DateCreated
                };

                return Ok(userDto);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating user with ID: {UserId}", id);
                return StatusCode(500, "An error occurred while updating the user");
            }
        }

        // DELETE: api/users/{id}
        [HttpDelete("{id}")]
        [AllowAnonymous] // Remove this in production and add proper authorization
        public async Task<IActionResult> DeleteUser(int id)
        {
            try
            {
                var deleted = await _userService.DeleteUserAsync(id);
                if (!deleted)
                    return NotFound($"User with ID {id} not found");

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting user with ID: {UserId}", id);
                return StatusCode(500, "An error occurred while deleting the user");
            }
        }

        // POST: api/users/bulk-delete
        [HttpPost("bulk-delete")]
        [AllowAnonymous] // Remove this in production and add proper authorization
        public async Task<IActionResult> DeleteUsersBulk([FromBody] BulkDeleteRequest request)
        {
            try
            {
                if (request?.UserIds == null || !request.UserIds.Any())
                    return BadRequest("User IDs are required for bulk deletion");

                // Convert string IDs to integers
                var userIds = new List<int>();
                foreach (var idString in request.UserIds)
                {
                    if (int.TryParse(idString, out int id))
                        userIds.Add(id);
                    else
                        return BadRequest($"Invalid user ID format: {idString}");
                }

                var deleted = await _userService.DeleteUsersBulkAsync(userIds.ToArray());
                if (!deleted)
                    return NotFound("No users found with the provided IDs");

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error bulk deleting users");
                return StatusCode(500, "An error occurred while deleting users");
            }
        }

        // GET: api/users/username/{username}
        [HttpGet("username/{username}")]
        [AllowAnonymous] // Remove this in production and add proper authorization
        public async Task<ActionResult<UserResponseDto>> GetUserByUsername(string username)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(username))
                    return BadRequest("Username is required");

                var user = await _userService.GetUserByUsernameAsync(username);
                if (user == null)
                    return NotFound($"User with username '{username}' not found");

                var userDto = new UserResponseDto
                {
                    UserId = user.UserId,
                    Username = user.Username,
                    FullName = user.FullName,
                    Role = user.Role,
                    Email = user.Email,
                    Phone = user.Phone,
                    DateCreated = user.DateCreated
                };

                return Ok(userDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user with username: {Username}", username);
                return StatusCode(500, "An error occurred while retrieving the user");
            }
        }

        private static bool IsValidEmail(string email)
        {
            try
            {
                var addr = new System.Net.Mail.MailAddress(email);
                return addr.Address == email;
            }
            catch
            {
                return false;
            }
        }
    }

    // Request model for bulk delete
    public class BulkDeleteRequest
    {
        public string[] UserIds { get; set; } = Array.Empty<string>();
    }
}
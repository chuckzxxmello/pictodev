using Microsoft.EntityFrameworkCore;
using PictoIMS.API.Data;
using PictoIMS.API.Models;
using BCrypt.Net;

namespace PictoIMS.API.Services
{
    public class UserService : IUserService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<UserService> _logger;

        public UserService(ApplicationDbContext context, ILogger<UserService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<IEnumerable<User>> GetAllUsersAsync()
        {
            try
            {
                return await _context.Users
                    .OrderBy(u => u.Username)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving all users");
                throw;
            }
        }

        public async Task<User?> GetUserByIdAsync(int id)
        {
            try
            {
                return await _context.Users.FindAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user with ID: {UserId}", id);
                throw;
            }
        }

        public async Task<User?> GetUserByUsernameAsync(string username)
        {
            try
            {
                return await _context.Users
                    .FirstOrDefaultAsync(u => u.Username.ToLower() == username.ToLower());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving user with username: {Username}", username);
                throw;
            }
        }

        public async Task<User> CreateUserAsync(CreateUserDto createUserDto)
        {
            try
            {
                // Validate required fields
                if (string.IsNullOrWhiteSpace(createUserDto.Username))
                    throw new ArgumentException("Username is required");

                if (string.IsNullOrWhiteSpace(createUserDto.Password))
                    throw new ArgumentException("Password is required");

                if (string.IsNullOrWhiteSpace(createUserDto.FullName))
                    throw new ArgumentException("Full name is required");

                if (string.IsNullOrWhiteSpace(createUserDto.Role))
                    throw new ArgumentException("Role is required");

                // Check if username already exists
                if (await UsernameExistsAsync(createUserDto.Username))
                    throw new InvalidOperationException($"Username '{createUserDto.Username}' already exists");

                // Check if email already exists (if provided)
                if (!string.IsNullOrWhiteSpace(createUserDto.Email) && await EmailExistsAsync(createUserDto.Email))
                    throw new InvalidOperationException($"Email '{createUserDto.Email}' already exists");

                // Validate role
                var allowedRoles = new[] { "Admin", "Manager", "User" };
                if (!allowedRoles.Contains(createUserDto.Role))
                    throw new ArgumentException($"Invalid role. Allowed roles: {string.Join(", ", allowedRoles)}");

                // Hash the password
                string passwordHash = BCrypt.Net.BCrypt.HashPassword(createUserDto.Password, 12);

                // Create user entity
                var user = new User
                {
                    Username = createUserDto.Username.Trim(),
                    PasswordHash = passwordHash,
                    FullName = createUserDto.FullName.Trim(),
                    Role = createUserDto.Role,
                    Email = string.IsNullOrWhiteSpace(createUserDto.Email) ? null : createUserDto.Email.Trim().ToLower(),
                    Phone = string.IsNullOrWhiteSpace(createUserDto.Phone) ? null : createUserDto.Phone.Trim(),
                    DateCreated = DateTime.UtcNow
                };

                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                _logger.LogInformation("User created successfully: {Username}", user.Username);
                return user;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating user: {Username}", createUserDto.Username);
                throw;
            }
        }

        public async Task<User?> UpdateUserAsync(int id, UpdateUserDto updateUserDto)
        {
            try
            {
                var existingUser = await GetUserByIdAsync(id);
                if (existingUser == null)
                    return null;

                // Check username uniqueness (if changing)
                if (!string.IsNullOrWhiteSpace(updateUserDto.Username) &&
                    updateUserDto.Username != existingUser.Username &&
                    await UsernameExistsAsync(updateUserDto.Username, id))
                {
                    throw new InvalidOperationException($"Username '{updateUserDto.Username}' already exists");
                }

                // Check email uniqueness (if changing)
                if (!string.IsNullOrWhiteSpace(updateUserDto.Email) &&
                    updateUserDto.Email.ToLower() != existingUser.Email?.ToLower() &&
                    await EmailExistsAsync(updateUserDto.Email, id))
                {
                    throw new InvalidOperationException($"Email '{updateUserDto.Email}' already exists");
                }

                // Validate role (if changing)
                if (!string.IsNullOrWhiteSpace(updateUserDto.Role))
                {
                    var allowedRoles = new[] { "Admin", "Manager", "User" };
                    if (!allowedRoles.Contains(updateUserDto.Role))
                        throw new ArgumentException($"Invalid role. Allowed roles: {string.Join(", ", allowedRoles)}");
                }

                // Update fields if provided
                if (!string.IsNullOrWhiteSpace(updateUserDto.Username))
                    existingUser.Username = updateUserDto.Username.Trim();

                if (!string.IsNullOrWhiteSpace(updateUserDto.Password))
                    existingUser.PasswordHash = BCrypt.Net.BCrypt.HashPassword(updateUserDto.Password, 12);

                if (!string.IsNullOrWhiteSpace(updateUserDto.FullName))
                    existingUser.FullName = updateUserDto.FullName.Trim();

                if (!string.IsNullOrWhiteSpace(updateUserDto.Role))
                    existingUser.Role = updateUserDto.Role;

                if (updateUserDto.Email != null)
                    existingUser.Email = string.IsNullOrWhiteSpace(updateUserDto.Email) ? null : updateUserDto.Email.Trim().ToLower();

                if (updateUserDto.Phone != null)
                    existingUser.Phone = string.IsNullOrWhiteSpace(updateUserDto.Phone) ? null : updateUserDto.Phone.Trim();

                await _context.SaveChangesAsync();

                _logger.LogInformation("User updated successfully: {Username}", existingUser.Username);
                return existingUser;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating user with ID: {UserId}", id);
                throw;
            }
        }

        public async Task<bool> DeleteUserAsync(int id)
        {
            try
            {
                var user = await GetUserByIdAsync(id);
                if (user == null)
                    return false;

                _context.Users.Remove(user);
                await _context.SaveChangesAsync();

                _logger.LogInformation("User deleted successfully: {Username}", user.Username);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting user with ID: {UserId}", id);
                throw;
            }
        }

        public async Task<bool> DeleteUsersBulkAsync(int[] userIds)
        {
            try
            {
                if (userIds == null || !userIds.Any())
                    return false;

                var users = await _context.Users
                    .Where(u => userIds.Contains(u.UserId))
                    .ToListAsync();

                if (!users.Any())
                    return false;

                _context.Users.RemoveRange(users);
                await _context.SaveChangesAsync();

                _logger.LogInformation("Bulk deleted {Count} users", users.Count);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error bulk deleting users");
                throw;
            }
        }

        public async Task<bool> UserExistsAsync(int id)
        {
            try
            {
                return await _context.Users.AnyAsync(u => u.UserId == id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking if user exists with ID: {UserId}", id);
                throw;
            }
        }

        public async Task<bool> UsernameExistsAsync(string username, int? excludeUserId = null)
        {
            try
            {
                var query = _context.Users.Where(u => u.Username.ToLower() == username.ToLower());

                if (excludeUserId.HasValue)
                    query = query.Where(u => u.UserId != excludeUserId.Value);

                return await query.AnyAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking username existence: {Username}", username);
                throw;
            }
        }

        public async Task<bool> EmailExistsAsync(string email, int? excludeUserId = null)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(email))
                    return false;

                var query = _context.Users.Where(u => u.Email != null && u.Email.ToLower() == email.ToLower());

                if (excludeUserId.HasValue)
                    query = query.Where(u => u.UserId != excludeUserId.Value);

                return await query.AnyAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking email existence: {Email}", email);
                throw;
            }
        }
    }
}
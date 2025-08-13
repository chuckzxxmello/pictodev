using Microsoft.AspNetCore.Mvc;
using PictoIMS.API.Services;
using PictoIMS.API.DTOs;

namespace PictoIMS.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
        {
            var result = await _authService.AuthenticateAsync(loginDto.Username, loginDto.Password);

            if (!result.Success)
                return Unauthorized(result.Message);

            return Ok(new { token = result.Token, user = result.User });
        }
    }
}

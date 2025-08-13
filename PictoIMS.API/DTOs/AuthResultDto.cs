namespace PictoIMS.API.DTOs
{
    public class AuthResultDto
    {
        public bool Success { get; set; }
        public string Token { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public UserDto User { get; set; } = new UserDto();
    }
}
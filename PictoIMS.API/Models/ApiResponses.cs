namespace PictoIMS.API.Models
{
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
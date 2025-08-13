using PictoIMS.API.DTOs;
using System.Threading.Tasks;

namespace PictoIMS.API.Services
{
    public interface IAuthService
    {
        Task<AuthResultDto> AuthenticateAsync(string username, string password);
    }
}   
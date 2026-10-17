using System.Threading.Tasks;
using VeggieAISEP490.Model.DTOs.Auth;

namespace VeggieAISEP490.Service.Interfaces;

public interface IAuthService
{
    Task<AuthResponse> LoginAsync(LoginRequest request);
    Task<AuthResponse> RegisterAsync(RegisterRequest request);
}

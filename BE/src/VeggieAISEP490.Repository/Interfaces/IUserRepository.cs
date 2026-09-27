using System.Threading.Tasks;
using VeggieAISEP490.Model.Entities;

namespace VeggieAISEP490.Repository.Interfaces;

public interface IUserRepository
{
    Task<User?> GetUserByUsernameAsync(string username);
    Task<User?> GetUserByEmailAsync(string email);
    Task<User> CreateUserAsync(User user);
    Task<bool> UserExistsAsync(string username, string email);
}

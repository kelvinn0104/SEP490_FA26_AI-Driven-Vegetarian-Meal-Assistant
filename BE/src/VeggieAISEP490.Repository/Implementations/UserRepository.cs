using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;
using VeggieAISEP490.Model.Entities;
using VeggieAISEP490.Repository.Interfaces;

namespace VeggieAISEP490.Repository.Implementations;

public class UserRepository : IUserRepository
{
    private readonly AppDbContext _context;

    public UserRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<User?> GetUserByUsernameAsync(string username)
    {
        return await _context.Users.FirstOrDefaultAsync(u => u.Username == username);
    }

    public async Task<User?> GetUserByEmailAsync(string email)
    {
        return await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
    }

    public async Task<User> CreateUserAsync(User user)
    {
        _context.Users.Add(user);
        await _context.SaveChangesAsync();
        return user;
    }
    
    public async Task<bool> UserExistsAsync(string username, string email)
    {
        return await _context.Users.AnyAsync(u => u.Username == username || u.Email == email);
    }
}

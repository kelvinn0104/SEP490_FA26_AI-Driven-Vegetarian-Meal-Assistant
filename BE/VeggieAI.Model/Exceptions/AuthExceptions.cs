namespace VeggieAI.Model.Exceptions;

/// <summary>
/// Tài khoản tồn tại nhưng chưa xác thực email (Status = "pending").
/// ExceptionMiddleware trả về HTTP 403 kèm errors = ["EMAIL_NOT_VERIFIED"] để FE chuyển sang bước nhập OTP.
/// </summary>
public class EmailNotVerifiedException : Exception
{
    public const string Code = "EMAIL_NOT_VERIFIED";
    public string Email { get; }

    public EmailNotVerifiedException(string email, string message) : base(message)
    {
        Email = email;
    }
}

/// <summary>
/// Gửi yêu cầu quá nhanh / quá nhiều (ví dụ bấm "Gửi lại mã" khi chưa hết 60s).
/// ExceptionMiddleware trả về HTTP 429 kèm header Retry-After.
/// </summary>
public class TooManyRequestsException : Exception
{
    public const string Code = "TOO_MANY_REQUESTS";
    public int RetryAfterSeconds { get; }

    public TooManyRequestsException(string message, int retryAfterSeconds) : base(message)
    {
        RetryAfterSeconds = Math.Max(1, retryAfterSeconds);
    }
}

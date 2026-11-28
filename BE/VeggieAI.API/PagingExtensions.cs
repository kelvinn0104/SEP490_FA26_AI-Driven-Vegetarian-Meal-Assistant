using Microsoft.AspNetCore.Mvc;
using VeggieAI.Model.DTOs;

namespace VeggieAI.API;

public static class PagingExtensions
{
    /// <summary>
    /// Tạo PageQuery từ ?page=&amp;pageSize=. Vẫn nhận kiểu cũ ?page.Page=&amp;page.PageSize= (FE user đang dùng)
    /// khi tham số mới không có, để hai cách gọi đều phân trang đúng.
    /// </summary>
    public static PageQuery Paging(this ControllerBase controller, int? page, int? pageSize)
    {
        var q = controller.Request.Query;
        page ??= int.TryParse(q["page.Page"].FirstOrDefault(), out var p) ? p : null;
        pageSize ??= int.TryParse(q["page.PageSize"].FirstOrDefault(), out var s) ? s : null;
        return PageQuery.Of(page, pageSize);
    }
}

using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using VeggieAI.Model.DTOs;
using VeggieAI.Service.Services;

namespace VeggieAI.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductScansController : ControllerBase
{
    private readonly IVeganProductService _productService;

    public ProductScansController(IVeganProductService productService)
    {
        _productService = productService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<VeganProductScanDto>>>> GetProducts(
        [FromQuery] string? status,
        [FromQuery] string? category,
        [FromQuery] string? search)
    {
        var list = await _productService.GetProductsAsync(status, category, search);
        return Ok(ApiResponse<List<VeganProductScanDto>>.Ok(list));
    }

    [HttpGet("stats")]
    public async Task<ActionResult<ApiResponse<ProductScanStatsDto>>> GetStats()
    {
        var stats = await _productService.GetStatsAsync();
        return Ok(ApiResponse<ProductScanStatsDto>.Ok(stats));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<VeganProductScanDto>>> GetProduct(int id)
    {
        var item = await _productService.GetProductByIdAsync(id);
        if (item == null) return NotFound(ApiResponse<VeganProductScanDto>.Fail("Không tìm thấy sản phẩm"));
        return Ok(ApiResponse<VeganProductScanDto>.Ok(item));
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<VeganProductScanDto>>> CreateProduct([FromBody] CreateVeganProductRequest request)
    {
        var modId = GetCurrentUserId();
        var item = await _productService.CreateProductAsync(request, modId);
        return CreatedAtAction(nameof(GetProduct), new { id = item.Id }, ApiResponse<VeganProductScanDto>.Ok(item, "Thêm sản phẩm thành công"));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse<VeganProductScanDto>>> UpdateProduct(int id, [FromBody] UpdateVeganProductRequest request)
    {
        var item = await _productService.UpdateProductAsync(id, request);
        if (item == null) return NotFound(ApiResponse<VeganProductScanDto>.Fail("Không tìm thấy sản phẩm cần cập nhật"));
        return Ok(ApiResponse<VeganProductScanDto>.Ok(item, "Cập nhật sản phẩm thành công"));
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteProduct(int id)
    {
        var ok = await _productService.DeleteProductAsync(id);
        if (!ok) return NotFound(ApiResponse<bool>.Fail("Không tìm thấy sản phẩm cần xoá"));
        return Ok(ApiResponse<bool>.Ok(true, "Xoá sản phẩm thành công"));
    }

    [HttpPost("{id}/review")]
    public async Task<ActionResult<ApiResponse<bool>>> ReviewProductScan(int id, [FromBody] ReviewProductScanRequest request)
    {
        var modId = GetCurrentUserId();
        var ok = await _productService.ReviewProductScanAsync(id, request, modId);
        if (!ok) return NotFound(ApiResponse<bool>.Fail("Không tìm thấy sản phẩm cần thẩm định"));
        return Ok(ApiResponse<bool>.Ok(true, "Thẩm định nhãn thực phẩm và cấp chứng nhận thuần chay thành công!"));
    }

    private int GetCurrentUserId()
    {
        var idStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.TryParse(idStr, out var id) ? id : 1;
    }
}


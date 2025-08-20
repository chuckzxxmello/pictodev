using System.Collections.Generic;
using System.Threading.Tasks;
using PictoIMS.API.Models;

namespace PictoIMS.API.Services
{
    public interface IInventoryService
    {
        Task<List<PictoInventory>> GetAllAsync();
        Task<PictoInventory?> GetByIdAsync(int id);
        Task<PictoInventory> CreateAsync(PictoInventory inventory);
        Task<bool> UpdateAsync(int id, PictoInventory inventory);
        Task<bool> SoftDeleteAsync(int id, string? reason = null, string? archivedBy = null);
        Task<bool> SoftDeleteBulkAsync(int[] ids);
        Task<bool> HardDeleteAsync(int archiveId);
        Task<List<InventoryArchive>> GetAllArchivedAsync();
        Task<InventoryArchive?> GetArchivedByIdAsync(int id);

        Task<List<InventoryArchive>> SearchArchivedAsync(
        DateTime? dateFrom = null,
        DateTime? dateTo = null,
        string? serialNumber = null
        );
    }
}
using System.Collections.Generic;
using System.Threading.Tasks;
using PictoIMS.API.Models;

namespace PictoIMS.API.Services
{
    public interface IRequisitionService
    {
        Task<List<RequisitionForm>> GetAllAsync();
        Task<RequisitionForm?> GetByIdAsync(string id);
        Task<RequisitionForm> CreateAsync(RequisitionForm form);
        Task<bool> UpdateAsync(string id, RequisitionForm form);
        Task<bool> SoftDeleteAsync(string id, string reason = "Archived via API", string archivedBy = "system");
        Task<int> SoftDeleteBulkAsync(List<string> ids, string reason = "Bulk delete", string archivedBy = "system");
        Task<bool> HardDeleteAsync(string id);
        Task<List<RequisitionArchive>> GetAllArchivedAsync();
        Task<RequisitionArchive?> GetArchivedByIdAsync(string id);

        Task<List<RequisitionArchive>> SearchArchivedAsync(
        DateTime? dateFrom = null,
        DateTime? dateTo = null,
        string? rfId = null
        );
    }
}
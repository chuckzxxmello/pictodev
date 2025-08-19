using System.Collections.Generic;
using System.Threading.Tasks;
using PictoIMS.API.Models;

namespace PictoIMS.API.Services
{
    public interface IRequisitionService
    {
        Task<List<RequisitionForm>> GetAllAsync();
        Task<RequisitionForm?> GetByIdAsync(int id);
        Task<RequisitionForm> CreateAsync(RequisitionForm form);
        Task<bool> UpdateAsync(int id, RequisitionForm form);

        // Soft delete, move to archive with audit info
        Task<bool> SoftDeleteAsync(int id, string reason = "Archived via API", string archivedBy = "system");

        // Hard delete, permanently remove from archive
        Task<bool> HardDeleteAsync(int id);

        Task<List<RequisitionArchive>> GetAllArchivedAsync();
        Task<RequisitionArchive?> GetArchivedByIdAsync(int id);
    }
}
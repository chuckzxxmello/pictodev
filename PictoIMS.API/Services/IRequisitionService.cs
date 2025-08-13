using PictoIMS.API.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PictoIMS.API.Services
{
    public interface IRequisitionService
    {
        Task<List<RequisitionForm>> GetAllAsync();
        Task<RequisitionForm?> GetByIdAsync(int id);
        Task<RequisitionForm> CreateAsync(RequisitionForm form);
        Task<bool> UpdateAsync(int id, RequisitionForm form);
        Task<bool> SoftDeleteAsync(int id);
        Task<bool> HardDeleteAsync(int id);
        Task<List<RequisitionArchive>> GetAllArchivedAsync();
        Task<RequisitionArchive?> GetArchivedByIdAsync(int id);
    }
}

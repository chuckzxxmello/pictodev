using Microsoft.EntityFrameworkCore;
using PictoIMS.API.Data;
using PictoIMS.API.Models;

namespace PictoIMS.API.Services
{
    public class InventoryService : IInventoryService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<InventoryService> _logger;

        public InventoryService(ApplicationDbContext context, ILogger<InventoryService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<List<PictoInventory>> GetAllAsync()
        {
            try
            {
                return await _context.PictoInventories.ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching all inventory items");
                throw;
            }
        }

        public async Task<PictoInventory?> GetByIdAsync(int id)
        {
            try
            {
                return await _context.PictoInventories.FindAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching inventory item with ID {Id}", id);
                throw;
            }
        }

        public async Task<PictoInventory> CreateAsync(PictoInventory item)
        {
            try
            {
                _context.PictoInventories.Add(item);
                await _context.SaveChangesAsync();
                return item;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating inventory item");
                throw;
            }
        }

        public async Task<bool> UpdateAsync(int id, PictoInventory item)
        {
            try
            {
                var existing = await _context.PictoInventories.FindAsync(id);
                if (existing == null) return false;

                existing.ItemName = item.ItemName;
                existing.Description = item.Description;
                existing.Category = item.Category;
                existing.Quantity = item.Quantity;
                existing.Unit = item.Unit;
                existing.Location = item.Location;
                existing.Status = item.Status;
                existing.DateAdded = item.DateAdded;
                existing.SerialNumber = item.SerialNumber;

                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating inventory item {Id}", id);
                throw;
            }
        }

        public async Task<bool> SoftDeleteAsync(int id, string? reason = null, string? archivedBy = null)
        {
            try
            {
                var item = await _context.PictoInventories.FindAsync(id);
                if (item == null)
                    return false;

                var archive = new InventoryArchive
                {
                    ItemId = item.ItemId,
                    ItemName = item.ItemName,
                    Description = item.Description,
                    Category = item.Category,
                    Quantity = item.Quantity,
                    Unit = item.Unit,
                    Location = item.Location,
                    Status = item.Status,
                    DateAdded = item.DateAdded,
                    SerialNumber = item.SerialNumber,
                    ArchivedReason = reason ?? "Soft delete",
                    ArchivedBy = archivedBy ?? "System",
                    OriginalItemId = item.ItemId
                };

                _context.InventoryArchives.Add(archive);
                _context.PictoInventories.Remove(item);
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error soft deleting inventory item with ID {Id}", id);
                return false;
            }
        }

        public async Task<bool> SoftDeleteBulkAsync(int[] ids)
        {
            try
            {
                var items = await _context.PictoInventories
                                        .Where(i => ids.Contains(i.ItemId))
                                        .ToListAsync();

                if (!items.Any()) return false;

                foreach (var item in items)
                {
                    var archive = new InventoryArchive
                    {
                        ItemId = item.ItemId,
                        ItemName = item.ItemName,
                        Description = item.Description,
                        Category = item.Category,
                        Quantity = item.Quantity,
                        Unit = item.Unit,
                        Location = item.Location,
                        Status = item.Status,
                        DateAdded = item.DateAdded,
                        SerialNumber = item.SerialNumber,
                        ArchivedReason = "Bulk soft delete",
                        ArchivedBy = "System",
                        OriginalItemId = item.ItemId
                    };

                    _context.InventoryArchives.Add(archive);
                    _context.PictoInventories.Remove(item);
                }

                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error soft deleting inventory items in bulk");
                return false;
            }
        }

        public async Task<bool> HardDeleteAsync(int archiveId)
        {
            try
            {
                var archive = await _context.InventoryArchives.FindAsync(archiveId);
                if (archive == null) return false;

                _context.InventoryArchives.Remove(archive);
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error permanently deleting archived item {ArchiveId}", archiveId);
                throw;
            }
        }


        // Implementation must match exactly:
        public async Task<List<InventoryArchive>> GetAllArchivedAsync()
        {
            try
            {
                return await _context.InventoryArchives
                    .OrderByDescending(a => a.ArchivedAt)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching archived inventory items");
                throw;
            }
        }

public async Task<List<InventoryArchive>> SearchArchivedAsync(DateTime? start, DateTime? end, string? keyword)
{
    var query = _context.InventoryArchives.AsQueryable();

    if (start.HasValue)
        query = query.Where(a => a.ArchivedAt >= start.Value);

    if (end.HasValue)
        query = query.Where(a => a.ArchivedAt <= end.Value);

    if (!string.IsNullOrWhiteSpace(keyword))
        query = query.Where(a => a.ItemName.Contains(keyword) || a.Description.Contains(keyword));

    return await query.OrderByDescending(a => a.ArchivedAt).ToListAsync();
}



        public async Task<InventoryArchive?> GetArchivedByIdAsync(int archiveId)
        {
            try
            {
                return await _context.InventoryArchives.FindAsync(archiveId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching archived item with ID {ArchiveId}", archiveId);
                throw;
            }
        }
    }
}
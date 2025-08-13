using Microsoft.EntityFrameworkCore;
using PictoIMS.API.Models;

namespace PictoIMS.API.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; } = null!;
        public DbSet<PictoInventory> PictoInventories { get; set; } = null!;
        public DbSet<RequisitionForm> RequisitionForms { get; set; } = null!;
        public DbSet<RequisitionArchive> RequisitionArchives { get; set; } = null!;
        public DbSet<InventoryTrackingHistory> InventoryTrackingHistories { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<User>().ToTable("users");
            modelBuilder.Entity<PictoInventory>().ToTable("picto_inventory");
            modelBuilder.Entity<RequisitionForm>().ToTable("requisition_forms");
            modelBuilder.Entity<RequisitionArchive>().ToTable("requisition_archive");
            modelBuilder.Entity<InventoryTrackingHistory>().ToTable("inventory_tracking_history");
        }
    }
}
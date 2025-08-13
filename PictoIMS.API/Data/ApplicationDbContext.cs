using Microsoft.EntityFrameworkCore;
using PictoIMS.API.Models;

namespace PictoIMS.API.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<PictoInventory> PictoInventories { get; set; }
        public DbSet<RequisitionForm> RequisitionForms { get; set; }
        public DbSet<InventoryTrackingHistory> InventoryTrackingHistories { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // PostgreSQL table mappings (optional: match exact table names in your schema)
            modelBuilder.Entity<User>().ToTable("users");
            modelBuilder.Entity<PictoInventory>().ToTable("picto_inventory");
            modelBuilder.Entity<RequisitionForm>().ToTable("requisition_forms");
            modelBuilder.Entity<InventoryTrackingHistory>().ToTable("inventory_tracking_history");
        }
    }
}
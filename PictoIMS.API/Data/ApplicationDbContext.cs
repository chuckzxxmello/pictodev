using Microsoft.EntityFrameworkCore;
using PictoIMS.API.Models;

namespace PictoIMS.API.Data
{
    public class ApplicationDbContext : DbContext // gets the database tables
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; } = null!;
        public DbSet<PictoInventory> PictoInventories { get; set; } = null!;
        public DbSet<RequisitionForm> RequisitionForms { get; set; } = null!;
        public DbSet<RequisitionArchive> RequisitionArchives { get; set; } = null!;
        public DbSet<InventoryTrackingHistory> InventoryTrackingHistories { get; set; } = null!;
        public DbSet<InventoryArchive> InventoryArchives { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // getting the database tables from pictodb database
            modelBuilder.Entity<User>().ToTable("users");                                // get users database
            modelBuilder.Entity<PictoInventory>().ToTable("picto_inventory");            // get inventory database
            modelBuilder.Entity<InventoryArchive>().ToTable("picto_archive");            // get inventory archive
            modelBuilder.Entity<RequisitionForm>().ToTable("requisition_forms");         // get requisition form database
            modelBuilder.Entity<RequisitionArchive>().ToTable("requisition_archive");    // get requisition form archive database

            // modelBuilder.Entity<RequestForm>().ToTable("request_form");
            // modelBuilder.Entity<RequestForm>().ToTable("request_archive");
        }
    }
}
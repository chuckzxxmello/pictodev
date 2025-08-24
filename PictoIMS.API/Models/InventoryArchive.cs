using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PictoIMS.API.Models
{
    [Table("picto_archive")]
    public class InventoryArchive
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Column("archive_id")]
        public int ArchiveId { get; set; }

        [Column("item_id")]
        public int ItemId { get; set; }

        [Column("item_name")]
        [StringLength(255)]
        public string ItemName { get; set; } = string.Empty;

        [Column("description")]
        public string? Description { get; set; }

        [Column("category")]
        [StringLength(100)]
        public string? Category { get; set; }

        [Column("quantity")]
        public int Quantity { get; set; }

        [Column("unit")]
        [StringLength(50)]
        public string? Unit { get; set; }

        [Column("location")]
        [StringLength(100)]
        public string? Location { get; set; }

        [Column("status")]
        [StringLength(50)]
        public string? Status { get; set; }

        [Column("date_added")]
        public DateTime? DateAdded { get; set; }

        [Column("serial_number")]
        [StringLength(100)]
        public string? SerialNumber { get; set; }

        [Column("stock_threshold")]
        public int StockThreshold { get; set; } = 10;

        // Archive metadata
        [Column("archived_at")]
        public DateTime ArchivedAt { get; set; } = DateTime.UtcNow;

        [Column("archived_reason")]
        public string? ArchivedReason { get; set; }

        [Column("archived_by")]
        public string? ArchivedBy { get; set; }

        [Column("original_item_id")]
        public int? OriginalItemId { get; set; }
    }
}

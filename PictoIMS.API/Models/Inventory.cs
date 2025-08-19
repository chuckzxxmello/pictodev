using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;

namespace PictoIMS.API.Models
{
    [Table("picto_inventory")]
    public class PictoInventory
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Column("item_id")]
        public int ItemId { get; set; }

        [Required]
        [StringLength(100)]
        [Column("item_name")]
        public string ItemName { get; set; } = string.Empty;

        [Column("description")]
        public string? Description { get; set; }

        [StringLength(50)]
        [Column("category")]
        public string? Category { get; set; }

        [Column("quantity")]
        public int Quantity { get; set; } = 0;

        [StringLength(20)]
        [Column("unit")]
        public string? Unit { get; set; }

        [StringLength(100)]
        [Column("location")]
        public string? Location { get; set; }

        [StringLength(20)]
        [Column("status")]
        public string Status { get; set; } = "Available";

        [Column("date_added")]
        public DateTime DateAdded { get; set; } = DateTime.UtcNow;

        [Column("serial_number")]
        [StringLength(100)]
        public string? SerialNumber { get; set; }

        public virtual ICollection<InventoryTrackingHistory> TrackingHistory { get; set; } = new List<InventoryTrackingHistory>();
        public virtual ICollection<TransferIn> TransferIns { get; set; } = new List<TransferIn>();
        public virtual ICollection<TransferOut> TransferOuts { get; set; } = new List<TransferOut>();
    }

    [Table("inventory_tracking_history")]
    public class InventoryTrackingHistory
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Column("history_id")]
        public int HistoryId { get; set; }

        [Column("item_id")]
        public int ItemId { get; set; }

        [Column("audit_year")]
        public int AuditYear { get; set; }

        [Column("quantity")]
        public int Quantity { get; set; }

        [Column("remarks")]
        public string? Remarks { get; set; }

        [Column("date_recorded")]
        public DateTime DateRecorded { get; set; } = DateTime.UtcNow;

        [JsonIgnore]
        [ValidateNever]
        public virtual PictoInventory? Item { get; set; }
    }

    [Table("transfer_in")]
    public class TransferIn
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Column("transfer_in_id")]
        public int TransferInId { get; set; }

        [Column("item_id")]
        public int ItemId { get; set; }

        [Column("quantity")]
        public int Quantity { get; set; }

        [StringLength(100)]
        [Column("from_location")]
        public string? FromLocation { get; set; }

        [Column("date_received")]
        public DateTime DateReceived { get; set; } = DateTime.UtcNow;

        [StringLength(100)]
        [Column("received_by_name")]
        public string? ReceivedByName { get; set; }

        [StringLength(100)]
        [Column("received_by_position")]
        public string? ReceivedByPosition { get; set; }

        [Column("remarks")]
        public string? Remarks { get; set; }

        [JsonIgnore]
        [ValidateNever]
        public virtual PictoInventory? Item { get; set; }
    }

    [Table("transfer_out")]
    public class TransferOut
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        [Column("transfer_out_id")]
        public int TransferOutId { get; set; }

        [Column("item_id")]
        public int ItemId { get; set; }

        [Column("quantity")]
        public int Quantity { get; set; }

        [StringLength(100)]
        [Column("to_location")]
        public string? ToLocation { get; set; }

        [Column("date_transferred")]
        public DateTime DateTransferred { get; set; } = DateTime.UtcNow;

        [StringLength(100)]
        [Column("transferred_by_name")]
        public string? TransferredByName { get; set; }

        [StringLength(100)]
        [Column("transferred_by_position")]
        public string? TransferredByPosition { get; set; }

        [Column("remarks")]
        public string? Remarks { get; set; }

        [JsonIgnore]
        [ValidateNever]
        public virtual PictoInventory? Item { get; set; }
    }
}

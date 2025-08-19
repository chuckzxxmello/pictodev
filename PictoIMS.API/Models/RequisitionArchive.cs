using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PictoIMS.API.Models
{
    [Table("requisition_archive")]
    public class RequisitionArchive
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.None)] // Use same ID as original requisition form
        [Column("rf_id")]
        public int RfId { get; set; }

        [Column("requester_name")]
        public string RequesterName { get; set; } = null!;

        [Column("requester_position")]
        public string RequesterPosition { get; set; } = null!;

        [Column("department")]
        public string Department { get; set; } = null!;

        [Column("purpose")]
        public string Purpose { get; set; } = null!;

        [Column("date_requested", TypeName = "timestamp with time zone")]
        public DateTime? DateRequested { get; set; }

        [Column("checked_by_name")]
        public string? CheckedByName { get; set; }

        [Column("checked_by_position")]
        public string? CheckedByPosition { get; set; }

        [Column("checked_by_date", TypeName = "timestamp with time zone")]
        public DateTime? CheckedByDate { get; set; }

        [Column("approved_by_name")]
        public string? ApprovedByName { get; set; }

        [Column("approved_by_position")]
        public string? ApprovedByPosition { get; set; }

        [Column("approved_by_date", TypeName = "timestamp with time zone")]
        public DateTime? ApprovedByDate { get; set; }

        [Column("issued_by_name")]
        public string? IssuedByName { get; set; }

        [Column("issued_by_position")]
        public string? IssuedByPosition { get; set; }

        [Column("issued_by_date", TypeName = "timestamp with time zone")]
        public DateTime? IssuedByDate { get; set; }

        [Column("received_by_name")]
        public string? ReceivedByName { get; set; }

        [Column("received_by_position")]
        public string? ReceivedByPosition { get; set; }

        [Column("received_by_date", TypeName = "timestamp with time zone")]
        public DateTime? ReceivedByDate { get; set; }

        [Column("is_archived")]
        public bool IsArchived { get; set; } = true;

        // audit trail for archive action
        [Column("archived_at", TypeName = "timestamp with time zone")]
        public DateTime ArchivedAt { get; set; } = DateTime.UtcNow;

        [Column("archived_reason")]
        public string? ArchivedReason { get; set; }

        [Column("archived_by")]
        public string? ArchivedBy { get; set; }
    }
}
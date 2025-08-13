using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PictoIMS.API.Models
{
    [Table("requisition_forms")]
    public class RequisitionForm
    {
        [Key]
        [Column("rf_id")]
        public int RfId { get; set; }

        [Required(ErrorMessage = "Requester name is required")]
        [StringLength(100, ErrorMessage = "Requester name cannot exceed 100 characters")]
        [Column("requester_name")]
        public string RequesterName { get; set; } = null!;

        [Required(ErrorMessage = "Requester position is required")]
        [StringLength(100, ErrorMessage = "Requester position cannot exceed 100 characters")]
        [Column("requester_position")]
        public string RequesterPosition { get; set; } = null!;

        [Required(ErrorMessage = "Department is required")]
        [StringLength(100, ErrorMessage = "Department cannot exceed 100 characters")]
        [Column("department")]
        public string Department { get; set; } = null!;

        [Required(ErrorMessage = "Purpose is required")]
        [StringLength(500, ErrorMessage = "Purpose cannot exceed 500 characters")]
        [Column("purpose")]
        public string Purpose { get; set; } = null!;

        [Column("date_requested", TypeName = "timestamp with time zone")]
        public DateTime? DateRequested { get; set; }

        [StringLength(100, ErrorMessage = "Checked by name cannot exceed 100 characters")]
        [Column("checked_by_name")]
        public string? CheckedByName { get; set; }

        [StringLength(100, ErrorMessage = "Checked by position cannot exceed 100 characters")]
        [Column("checked_by_position")]
        public string? CheckedByPosition { get; set; }

        [Column("checked_by_date", TypeName = "timestamp with time zone")]
        public DateTime? CheckedByDate { get; set; }

        [StringLength(100, ErrorMessage = "Approved by name cannot exceed 100 characters")]
        [Column("approved_by_name")]
        public string? ApprovedByName { get; set; }

        [StringLength(100, ErrorMessage = "Approved by position cannot exceed 100 characters")]
        [Column("approved_by_position")]
        public string? ApprovedByPosition { get; set; }

        [Column("approved_by_date", TypeName = "timestamp with time zone")]
        public DateTime? ApprovedByDate { get; set; }

        [StringLength(100, ErrorMessage = "Issued by name cannot exceed 100 characters")]
        [Column("issued_by_name")]
        public string? IssuedByName { get; set; }

        [StringLength(100, ErrorMessage = "Issued by position cannot exceed 100 characters")]
        [Column("issued_by_position")]
        public string? IssuedByPosition { get; set; }

        [Column("issued_by_date", TypeName = "timestamp with time zone")]
        public DateTime? IssuedByDate { get; set; }

        [StringLength(100, ErrorMessage = "Received by name cannot exceed 100 characters")]
        [Column("received_by_name")]
        public string? ReceivedByName { get; set; }

        [StringLength(100, ErrorMessage = "Received by position cannot exceed 100 characters")]
        [Column("received_by_position")]
        public string? ReceivedByPosition { get; set; }

        [Column("received_by_date", TypeName = "timestamp with time zone")]
        public DateTime? ReceivedByDate { get; set; }

        [Column("is_archived")]
        public bool IsArchived { get; set; } = false;
    }
}
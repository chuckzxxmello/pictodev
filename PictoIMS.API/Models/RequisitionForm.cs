using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Swashbuckle.AspNetCore.Annotations; // 👈 Needed for SwaggerSchema

namespace PictoIMS.API.Models
{
    [Table("requisition_forms")]
    public class RequisitionForm
    {
        [Key]
        [Column("rf_id")]
        [StringLength(50)]
        [SwaggerSchema(ReadOnly = true)] // 👈 Swagger won't ask for rfId on POST
        public string RfId { get; set; } = Guid.NewGuid().ToString();  // auto-generate

        [Required(ErrorMessage = "Requester name is required")]
        [StringLength(100)]
        [Column("requester_name")]
        public string RequesterName { get; set; } = null!;

        [Required(ErrorMessage = "Requester position is required")]
        [StringLength(100)]
        [Column("requester_position")]
        public string RequesterPosition { get; set; } = null!;

        [Required(ErrorMessage = "Department is required")]
        [StringLength(100)]
        [Column("department")]
        public string Department { get; set; } = null!;

        [Required(ErrorMessage = "Purpose is required")]
        [StringLength(500)]
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
        public bool IsArchived { get; set; } = false;
    }
}
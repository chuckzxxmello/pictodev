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

        [Column("requester_name")]
        public required string RequesterName { get; set; }

        [Column("requester_position")]
        public required string RequesterPosition { get; set; }

        [Column("department")]
        public required string Department { get; set; }

        [Column("purpose")]
        public required string Purpose { get; set; }

        [Column("date_requested")]
        public DateTime DateRequested { get; set; }

        [Column("checked_by_name")]
        public required string CheckedByName { get; set; }

        [Column("checked_by_position")]
        public required string CheckedByPosition { get; set; }

        [Column("checked_by_date")]
        public DateTime CheckedByDate { get; set; }

        [Column("approved_by_name")]
        public required string ApprovedByName { get; set; }

        [Column("approved_by_position")]
        public required string ApprovedByPosition { get; set; }

        [Column("approved_by_date")]
        public DateTime ApprovedByDate { get; set; }

        [Column("issued_by_name")]
        public required string IssuedByName { get; set; }

        [Column("issued_by_position")]
        public required string IssuedByPosition { get; set; }

        [Column("issued_by_date")]
        public DateTime IssuedByDate { get; set; }

        [Column("received_by_name")]
        public required string ReceivedByName { get; set; }

        [Column("received_by_position")]
        public required string ReceivedByPosition { get; set; }

        [Column("received_by_date")]
        public DateTime ReceivedByDate { get; set; }

        [Column("is_archived")]
        public bool IsArchived { get; set; } = false;
    }
}
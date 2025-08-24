using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Swashbuckle.AspNetCore.Annotations;

namespace PictoIMS.API.Models
{

    // Represents a requisition form entity in the inventory management system.
    // This model handles the complete workflow from request to fulfillment.

    // REQUISITON TABLE DATA COLUMNS
    // rf_id
    // rs_number
    // rf_number
    // requester_name
    // requester_position
    // department
    // purpose
    // date_requested
    // checked_by_name
    // checked_by_position
    // checked_by_date
    // approved_by_name
    // approved_by_position
    // approved_by_date
    // issued_by_name
    // issued_by_position
    // issued_by_date
    // received_by_name
    // received_by_position
    // received_by_date
    // is_archived


    // ps. use timestamp with time zone if setting time

    [Table("requisition_forms")] // all the key data in the requisition_forms table
    public class RequisitionForm
    {
        #region IMPORTANT KEY IDS

        // Unique identifier for the requisition form (auto-generated GUID)
        [Key]
        [Column("rf_id")]
        [StringLength(50)]
        [SwaggerSchema(ReadOnly = true, Description = "Auto-generated unique identifier")]
        public string RfId { get; set; } = Guid.NewGuid().ToString();

        // Reference number from the requisition system (optional)
        [Column("rs_number")]
        [StringLength(100)]
        [SwaggerSchema(Description = "System-generated requisition sequence number")]
        public string? RsNumber { get; set; }

        // Manual form reference number (optional)
        [Column("rf_number")]
        [StringLength(100)]
        [SwaggerSchema(Description = "Manual form reference number")]
        public string? RfNumber { get; set; }

        #endregion

        #region REQUESTOR INFO

        // Name of the person making the requisition request
        [Required(ErrorMessage = "Requester name is required")]
        [StringLength(100, MinimumLength = 2, ErrorMessage = "Requester name must be between 2 and 100 characters")]
        [Column("requester_name")]
        [SwaggerSchema(Description = "Full name of the person requesting items")]
        public string RequesterName { get; set; } = null!;

        // Job position/title of the requester
        [Required(ErrorMessage = "Requester position is required")]
        [StringLength(100, MinimumLength = 2, ErrorMessage = "Position must be between 2 and 100 characters")]
        [Column("requester_position")]
        [SwaggerSchema(Description = "Job title or position of the requester")]
        public string RequesterPosition { get; set; } = null!;

        // Department or organizational unit making the request
        [Required(ErrorMessage = "Department is required")]
        [StringLength(100, MinimumLength = 2, ErrorMessage = "Department must be between 2 and 100 characters")]
        [Column("department")]
        [SwaggerSchema(Description = "Department or unit making the request")]
        public string Department { get; set; } = null!;

        // Business justification or purpose for the requisition
        [Required(ErrorMessage = "Purpose is required")]
        [StringLength(500, MinimumLength = 10, ErrorMessage = "Purpose must be between 10 and 500 characters")]
        [Column("purpose")]
        [SwaggerSchema(Description = "Business justification for the requisition")]
        public string Purpose { get; set; } = null!;

        // Date and time when the requisition was submitted (UTC)
        [Column("date_requested", TypeName = "timestamp with time zone")]
        [SwaggerSchema(Description = "UTC timestamp when request was submitted")]
        public DateTime? DateRequested { get; set; }

        #endregion

        #region CHECKER WORKFLOW FIELDS

        // Name of the person who checked/reviewed the requisition
        [Column("checked_by_name")]
        [StringLength(100)]
        [SwaggerSchema(Description = "Name of reviewer who checked the requisition")]
        public string? CheckedByName { get; set; }

        // Position of the checker/reviewer
        [Column("checked_by_position")]
        [StringLength(100)]
        [SwaggerSchema(Description = "Position of the checker")]
        public string? CheckedByPosition { get; set; }

        /// <summary>
        /// Date when the requisition was checked/reviewed (UTC)
        /// </summary>
        [Column("checked_by_date", TypeName = "timestamp with time zone")]
        [SwaggerSchema(Description = "UTC timestamp when requisition was checked")]
        public DateTime? CheckedByDate { get; set; }

        #endregion

        #region APPROVAL WORKFLOW FIELDS

        // Name of the approving authority
        [Column("approved_by_name")]
        [StringLength(100)]
        [SwaggerSchema(Description = "Name of the approver")]
        public string? ApprovedByName { get; set; }

        // Position/title of the approving authority
        [Column("approved_by_position")]
        [StringLength(100)]
        [SwaggerSchema(Description = "Position of the approver")]
        public string? ApprovedByPosition { get; set; }

        // Date when the requisition was approved (UTC)
        [Column("approved_by_date", TypeName = "timestamp with time zone")]
        [SwaggerSchema(Description = "UTC timestamp when requisition was approved")]
        public DateTime? ApprovedByDate { get; set; }

        #endregion

        #region ISSUANCE WORKFLOW FIELDS

        // Name of the person who issued the requested items
        [Column("issued_by_name")]
        [StringLength(100)]
        [SwaggerSchema(Description = "Name of the person who issued items")]
        public string? IssuedByName { get; set; }

        // Position of the issuing person
        [Column("issued_by_position")]
        [StringLength(100)]
        [SwaggerSchema(Description = "Position of the issuer")]
        public string? IssuedByPosition { get; set; }

        // Date when items were issued (UTC)
        [Column("issued_by_date", TypeName = "timestamp with time zone")]
        [SwaggerSchema(Description = "UTC timestamp when items were issued")]
        public DateTime? IssuedByDate { get; set; }

        #endregion

        #region RECEIPT WORKFLOW FIELDS

        // Name of the person who received the issued items
        [Column("received_by_name")]
        [StringLength(100)]
        [SwaggerSchema(Description = "Name of the person who received items")]
        public string? ReceivedByName { get; set; }

        // Position of the receiving person
        [Column("received_by_position")]
        [StringLength(100)]
        [SwaggerSchema(Description = "Position of the receiver")]
        public string? ReceivedByPosition { get; set; }

        // Date when items were received (UTC)
        [Column("received_by_date", TypeName = "timestamp with time zone")]
        [SwaggerSchema(Description = "UTC timestamp when items were received")]
        public DateTime? ReceivedByDate { get; set; }

        #endregion



        // Soft delete flag - indicates if record is archived
        [Column("is_archived")]
        [SwaggerSchema(Description = "Indicates if the record is archived (soft deleted)")]
        public bool IsArchived { get; set; } = false;

        // Gets the current workflow status based on completed stages
        [NotMapped]
        [SwaggerSchema(Description = "Current workflow status of the requisition")]
        public string WorkflowStatus
        {
            get
            {
                if (ReceivedByDate.HasValue) return "Completed";
                if (IssuedByDate.HasValue) return "Issued";
                if (ApprovedByDate.HasValue) return "Approved";
                if (CheckedByDate.HasValue) return "Checked";
                return "Pending";
            }
        }



        // Validates the workflow sequence - ensures dates follow logical order
        public bool IsWorkflowSequenceValid()
        {
            var dates = new List<DateTime?>
            {
                DateRequested,
                CheckedByDate,
                ApprovedByDate,
                IssuedByDate,
                ReceivedByDate
            };

            DateTime? previousDate = null;
            foreach (var date in dates)
            {
                if (date.HasValue)
                {
                    if (previousDate.HasValue && date < previousDate)
                        return false;
                    previousDate = date;
                }
            }
            return true;
        }
    }
}

using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Swashbuckle.AspNetCore.Annotations;

namespace PictoIMS.API.Models
{
    /// <summary>
    /// Archive table for requisition forms that have been soft-deleted.
    /// Maintains complete audit trail and allows for data recovery if needed.
    /// </summary>
    [Table("requisition_archives")]
    public class RequisitionArchive
    {
        /// <summary>
        /// Archive record unique identifier (auto-generated)
        /// </summary>
        [Key]
        [Column("archive_id")]
        [StringLength(50)]
        [SwaggerSchema(ReadOnly = true, Description = "Unique archive record identifier")]
        public string ArchiveId { get; set; } = Guid.NewGuid().ToString();

        /// <summary>
        /// Original requisition form ID (preserved from original record)
        /// </summary>
        [Required]
        [Column("rf_id")]
        [StringLength(50)]
        [SwaggerSchema(Description = "Original requisition form ID")]
        public string RfId { get; set; } = null!;

        /// <summary>
        /// Reference sequence number from original form
        /// </summary>
        [Column("rs_number")]
        [StringLength(100)]
        [SwaggerSchema(Description = "Original RS number")]
        public string? RsNumber { get; set; }

        /// <summary>
        /// Manual form reference number from original
        /// </summary>
        [Column("rf_number")]
        [StringLength(100)]
        [SwaggerSchema(Description = "Original RF number")]
        public string? RfNumber { get; set; }

        /// <summary>
        /// Name of the original requester
        /// </summary>
        [Column("requester_name")]
        [StringLength(100)]
        [SwaggerSchema(Description = "Name of original requester")]
        public string? RequesterName { get; set; }

        /// <summary>
        /// Position of the original requester
        /// </summary>
        [Column("requester_position")]
        [StringLength(100)]
        [SwaggerSchema(Description = "Position of original requester")]
        public string? RequesterPosition { get; set; }

        /// <summary>
        /// Department that made the original request
        /// </summary>
        [Column("department")]
        [StringLength(100)]
        [SwaggerSchema(Description = "Original requesting department")]
        public string? Department { get; set; }

        /// <summary>
        /// Purpose/justification from original request
        /// </summary>
        [Column("purpose")]
        [StringLength(500)]
        [SwaggerSchema(Description = "Original purpose/justification")]
        public string? Purpose { get; set; }

        /// <summary>
        /// Original request submission date (UTC)
        /// </summary>
        [Column("date_requested", TypeName = "timestamp with time zone")]
        [SwaggerSchema(Description = "Original request date (UTC)")]
        public DateTime? DateRequested { get; set; }

        // Original workflow fields preserved
        [Column("checked_by_name")]
        [StringLength(100)]
        public string? CheckedByName { get; set; }

        [Column("checked_by_position")]
        [StringLength(100)]
        public string? CheckedByPosition { get; set; }

        [Column("checked_by_date", TypeName = "timestamp with time zone")]
        public DateTime? CheckedByDate { get; set; }

        [Column("approved_by_name")]
        [StringLength(100)]
        public string? ApprovedByName { get; set; }

        [Column("approved_by_position")]
        [StringLength(100)]
        public string? ApprovedByPosition { get; set; }

        [Column("approved_by_date", TypeName = "timestamp with time zone")]
        public DateTime? ApprovedByDate { get; set; }

        [Column("issued_by_name")]
        [StringLength(100)]
        public string? IssuedByName { get; set; }

        [Column("issued_by_position")]
        [StringLength(100)]
        public string? IssuedByPosition { get; set; }

        [Column("issued_by_date", TypeName = "timestamp with time zone")]
        public DateTime? IssuedByDate { get; set; }

        [Column("received_by_name")]
        [StringLength(100)]
        public string? ReceivedByName { get; set; }

        [Column("received_by_position")]
        [StringLength(100)]
        public string? ReceivedByPosition { get; set; }

        [Column("received_by_date", TypeName = "timestamp with time zone")]
        public DateTime? ReceivedByDate { get; set; }

        /// <summary>
        /// Always true for archived records
        /// </summary>
        [Column("is_archived")]
        [SwaggerSchema(Description = "Archive flag (always true for archived records)")]
        public bool IsArchived { get; set; } = true;

        /// <summary>
        /// Timestamp when record was archived (UTC)
        /// </summary>
        [Required]
        [Column("archived_at", TypeName = "timestamp with time zone")]
        [SwaggerSchema(Description = "UTC timestamp when record was archived")]
        public DateTime ArchivedAt { get; set; } = DateTime.UtcNow;

        /// <summary>
        /// Reason for archiving the record
        /// </summary>
        [Column("archived_reason")]
        [StringLength(255)]
        [SwaggerSchema(Description = "Reason why the record was archived")]
        public string? ArchivedReason { get; set; }

        /// <summary>
        /// User or system that performed the archiving
        /// </summary>
        [Column("archived_by")]
        [StringLength(100)]
        [SwaggerSchema(Description = "User/system that archived the record")]
        public string? ArchivedBy { get; set; }

        /// <summary>
        /// Additional metadata about the archiving process
        /// </summary>
        [Column("archive_metadata")]
        [StringLength(1000)]
        [SwaggerSchema(Description = "Additional archiving metadata (JSON format)")]
        public string? ArchiveMetadata { get; set; }

        /// <summary>
        /// Version of the system when archived (for compatibility tracking)
        /// </summary>
        [Column("system_version")]
        [StringLength(50)]
        [SwaggerSchema(Description = "System version when archived")]
        public string? SystemVersion { get; set; }

        /// <summary>
        /// IP address of the user who initiated archiving (for audit trail)
        /// </summary>
        [Column("archived_from_ip")]
        [StringLength(45)] // IPv6 max length
        [SwaggerSchema(Description = "IP address of archiving user")]
        public string? ArchivedFromIp { get; set; }

        /// <summary>
        /// User agent of the client that initiated archiving
        /// </summary>
        [Column("user_agent")]
        [StringLength(500)]
        [SwaggerSchema(Description = "User agent of archiving client")]
        public string? UserAgent { get; set; }

        /// <summary>
        /// Indicates if this archived record can be restored
        /// </summary>
        [Column("is_restorable")]
        [SwaggerSchema(Description = "Whether this record can be restored")]
        public bool IsRestorable { get; set; } = true;

        /// <summary>
        /// Expiration date for the archived record (for retention policy)
        /// </summary>
        [Column("retention_expires_at", TypeName = "timestamp with time zone")]
        [SwaggerSchema(Description = "When this archived record expires per retention policy")]
        public DateTime? RetentionExpiresAt { get; set; }

        /// <summary>
        /// Gets the final workflow status that the form had before archiving
        /// </summary>
        [NotMapped]
        [SwaggerSchema(Description = "Final workflow status before archiving")]
        public string FinalWorkflowStatus
        {
            get
            {
                if (ReceivedByDate.HasValue) return "Completed";
                if (IssuedByDate.HasValue) return "Issued";
                if (ApprovedByDate.HasValue) return "Approved";
                if (CheckedByDate.HasValue) return "Checked";
                return "Incomplete";
            }
        }

        /// <summary>
        /// Gets the duration the record was active before archiving
        /// </summary>
        [NotMapped]
        [SwaggerSchema(Description = "Duration record was active before archiving")]
        public TimeSpan? ActiveDuration
        {
            get
            {
                if (DateRequested.HasValue)
                    return ArchivedAt - DateRequested.Value;
                return null;
            }
        }

        /// <summary>
        /// Checks if the archived record is expired based on retention policy
        /// </summary>
        /// <returns>True if record has passed retention expiration date</returns>
        public bool IsExpired()
        {
            return RetentionExpiresAt.HasValue && DateTime.UtcNow > RetentionExpiresAt.Value;
        }

        /// <summary>
        /// Creates an archive record from an existing RequisitionForm
        /// </summary>
        /// <param name="form">The original form to archive</param>
        /// <param name="reason">Reason for archiving</param>
        /// <param name="archivedBy">User/system performing the archive</param>
        /// <param name="retentionYears">Years to retain before expiration (default: 7)</param>
        /// <returns>New archive record</returns>
        public static RequisitionArchive FromRequisitionForm(
            RequisitionForm form,
            string? reason = null,
            string? archivedBy = null,
            int retentionYears = 7)
        {
            return new RequisitionArchive
            {
                RfId = form.RfId,
                RsNumber = form.RsNumber,
                RfNumber = form.RfNumber,
                RequesterName = form.RequesterName,
                RequesterPosition = form.RequesterPosition,
                Department = form.Department,
                Purpose = form.Purpose,
                DateRequested = form.DateRequested,
                CheckedByName = form.CheckedByName,
                CheckedByPosition = form.CheckedByPosition,
                CheckedByDate = form.CheckedByDate,
                ApprovedByName = form.ApprovedByName,
                ApprovedByPosition = form.ApprovedByPosition,
                ApprovedByDate = form.ApprovedByDate,
                IssuedByName = form.IssuedByName,
                IssuedByPosition = form.IssuedByPosition,
                IssuedByDate = form.IssuedByDate,
                ReceivedByName = form.ReceivedByName,
                ReceivedByPosition = form.ReceivedByPosition,
                ReceivedByDate = form.ReceivedByDate,
                ArchivedReason = reason ?? "Archived",
                ArchivedBy = archivedBy ?? "system",
                RetentionExpiresAt = DateTime.UtcNow.AddYears(retentionYears)
            };
        }
    }
}
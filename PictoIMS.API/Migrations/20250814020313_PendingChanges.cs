using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PictoIMS.API.Migrations
{
    /// <inheritdoc />
    public partial class PendingChanges : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<DateTime>(
                name: "date_created",
                table: "users",
                type: "timestamp without time zone",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone");

            migrationBuilder.AlterColumn<DateTime>(
                name: "date_transferred",
                table: "transfer_out",
                type: "timestamp without time zone",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone");

            migrationBuilder.AlterColumn<DateTime>(
                name: "date_received",
                table: "transfer_in",
                type: "timestamp without time zone",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone");

            migrationBuilder.AlterColumn<string>(
                name: "requester_position",
                table: "requisition_forms",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "purpose",
                table: "requisition_forms",
                type: "character varying(500)",
                maxLength: 500,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "department",
                table: "requisition_forms",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "date_requested",
                table: "requisition_forms",
                type: "timestamp with time zone",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone");

            migrationBuilder.AddColumn<bool>(
                name: "is_archived",
                table: "requisition_forms",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AlterColumn<DateTime>(
                name: "date_added",
                table: "picto_inventory",
                type: "timestamp without time zone",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone");

            migrationBuilder.AlterColumn<DateTime>(
                name: "date_recorded",
                table: "inventory_tracking_history",
                type: "timestamp without time zone",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone");

            migrationBuilder.CreateTable(
                name: "requisition_archive",
                columns: table => new
                {
                    rf_id = table.Column<int>(type: "integer", nullable: false),
                    requester_name = table.Column<string>(type: "text", nullable: false),
                    requester_position = table.Column<string>(type: "text", nullable: false),
                    department = table.Column<string>(type: "text", nullable: false),
                    purpose = table.Column<string>(type: "text", nullable: false),
                    date_requested = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    checked_by_name = table.Column<string>(type: "text", nullable: true),
                    checked_by_position = table.Column<string>(type: "text", nullable: true),
                    checked_by_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    approved_by_name = table.Column<string>(type: "text", nullable: true),
                    approved_by_position = table.Column<string>(type: "text", nullable: true),
                    approved_by_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    issued_by_name = table.Column<string>(type: "text", nullable: true),
                    issued_by_position = table.Column<string>(type: "text", nullable: true),
                    issued_by_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    received_by_name = table.Column<string>(type: "text", nullable: true),
                    received_by_position = table.Column<string>(type: "text", nullable: true),
                    received_by_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    is_archived = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_requisition_archive", x => x.rf_id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "requisition_archive");

            migrationBuilder.DropColumn(
                name: "is_archived",
                table: "requisition_forms");

            migrationBuilder.AlterColumn<DateTime>(
                name: "date_created",
                table: "users",
                type: "timestamp with time zone",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "timestamp without time zone");

            migrationBuilder.AlterColumn<DateTime>(
                name: "date_transferred",
                table: "transfer_out",
                type: "timestamp with time zone",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "timestamp without time zone");

            migrationBuilder.AlterColumn<DateTime>(
                name: "date_received",
                table: "transfer_in",
                type: "timestamp with time zone",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "timestamp without time zone");

            migrationBuilder.AlterColumn<string>(
                name: "requester_position",
                table: "requisition_forms",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100);

            migrationBuilder.AlterColumn<string>(
                name: "purpose",
                table: "requisition_forms",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(500)",
                oldMaxLength: 500);

            migrationBuilder.AlterColumn<string>(
                name: "department",
                table: "requisition_forms",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100);

            migrationBuilder.AlterColumn<DateTime>(
                name: "date_requested",
                table: "requisition_forms",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "date_added",
                table: "picto_inventory",
                type: "timestamp with time zone",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "timestamp without time zone");

            migrationBuilder.AlterColumn<DateTime>(
                name: "date_recorded",
                table: "inventory_tracking_history",
                type: "timestamp with time zone",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "timestamp without time zone");
        }
    }
}

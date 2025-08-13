using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace PictoIMS.API.Migrations
{
    /// <inheritdoc />
    public partial class pictodb : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "picto_inventory",
                columns: table => new
                {
                    item_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    item_name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    description = table.Column<string>(type: "text", nullable: true),
                    category = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    quantity = table.Column<int>(type: "integer", nullable: false),
                    unit = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    location = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    date_added = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_picto_inventory", x => x.item_id);
                });

            migrationBuilder.CreateTable(
                name: "requisition_forms",
                columns: table => new
                {
                    rf_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    requester_name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    requester_position = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    department = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    purpose = table.Column<string>(type: "text", nullable: true),
                    date_requested = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    checked_by_name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    checked_by_position = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    checked_by_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    approved_by_name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    approved_by_position = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    approved_by_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    issued_by_name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    issued_by_position = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    issued_by_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    received_by_name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    received_by_position = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    received_by_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_requisition_forms", x => x.rf_id);
                });

            migrationBuilder.CreateTable(
                name: "users",
                columns: table => new
                {
                    user_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    username = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    password_hash = table.Column<string>(type: "text", nullable: false),
                    full_name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    role = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    email = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    phone = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    date_created = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_users", x => x.user_id);
                });

            migrationBuilder.CreateTable(
                name: "inventory_tracking_history",
                columns: table => new
                {
                    history_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    item_id = table.Column<int>(type: "integer", nullable: false),
                    audit_year = table.Column<int>(type: "integer", nullable: false),
                    quantity = table.Column<int>(type: "integer", nullable: false),
                    remarks = table.Column<string>(type: "text", nullable: true),
                    date_recorded = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_inventory_tracking_history", x => x.history_id);
                    table.ForeignKey(
                        name: "FK_inventory_tracking_history_picto_inventory_item_id",
                        column: x => x.item_id,
                        principalTable: "picto_inventory",
                        principalColumn: "item_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "transfer_in",
                columns: table => new
                {
                    transfer_in_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    item_id = table.Column<int>(type: "integer", nullable: false),
                    quantity = table.Column<int>(type: "integer", nullable: false),
                    from_location = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    date_received = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    received_by_name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    received_by_position = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    remarks = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_transfer_in", x => x.transfer_in_id);
                    table.ForeignKey(
                        name: "FK_transfer_in_picto_inventory_item_id",
                        column: x => x.item_id,
                        principalTable: "picto_inventory",
                        principalColumn: "item_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "transfer_out",
                columns: table => new
                {
                    transfer_out_id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    item_id = table.Column<int>(type: "integer", nullable: false),
                    quantity = table.Column<int>(type: "integer", nullable: false),
                    to_location = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    date_transferred = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    transferred_by_name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    transferred_by_position = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    remarks = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_transfer_out", x => x.transfer_out_id);
                    table.ForeignKey(
                        name: "FK_transfer_out_picto_inventory_item_id",
                        column: x => x.item_id,
                        principalTable: "picto_inventory",
                        principalColumn: "item_id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_inventory_tracking_history_item_id",
                table: "inventory_tracking_history",
                column: "item_id");

            migrationBuilder.CreateIndex(
                name: "IX_transfer_in_item_id",
                table: "transfer_in",
                column: "item_id");

            migrationBuilder.CreateIndex(
                name: "IX_transfer_out_item_id",
                table: "transfer_out",
                column: "item_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "inventory_tracking_history");

            migrationBuilder.DropTable(
                name: "requisition_forms");

            migrationBuilder.DropTable(
                name: "transfer_in");

            migrationBuilder.DropTable(
                name: "transfer_out");

            migrationBuilder.DropTable(
                name: "users");

            migrationBuilder.DropTable(
                name: "picto_inventory");
        }
    }
}

CREATE OR ALTER PROCEDURE [dbo].[usp_Inventory_UpdateStatus]
    @Id     UNIQUEIDENTIFIER,
    @Status NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE [InventoryItems] SET Status = @Status WHERE Id = @Id;
END

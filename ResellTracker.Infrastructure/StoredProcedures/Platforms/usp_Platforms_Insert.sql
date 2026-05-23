CREATE OR ALTER PROCEDURE [dbo].[usp_Platforms_Insert]
    @Name           NVARCHAR(100),
    @FeePercentage  DECIMAL(5,  2),
    @FixedFee       DECIMAL(10, 2),
    @DefaultPostage DECIMAL(10, 2),
    @IsActive       BIT,
    @NewId          UNIQUEIDENTIFIER OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    SET @NewId = NEWID();
    INSERT INTO [Platforms] (Id, Name, FeePercentage, FixedFee, DefaultPostage, IsActive, CreatedAt)
    VALUES (@NewId, @Name, @FeePercentage, @FixedFee, @DefaultPostage, @IsActive, GETUTCDATE());
END

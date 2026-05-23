CREATE OR ALTER PROCEDURE [dbo].[usp_Platforms_Update]
    @Id             UNIQUEIDENTIFIER,
    @Name           NVARCHAR(100),
    @FeePercentage  DECIMAL(5,  2),
    @FixedFee       DECIMAL(10, 2),
    @DefaultPostage DECIMAL(10, 2),
    @IsActive       BIT
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE [Platforms]
    SET Name           = @Name,
        FeePercentage  = @FeePercentage,
        FixedFee       = @FixedFee,
        DefaultPostage = @DefaultPostage,
        IsActive       = @IsActive
    WHERE Id = @Id;
END

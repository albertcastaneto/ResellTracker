CREATE OR ALTER PROCEDURE [dbo].[usp_AuditLog_GetAll]
    @PageNumber INT = 1,
    @PageSize   INT = 50
AS
BEGIN
    SET NOCOUNT ON;
    SELECT Id, UserId, UserEmail, Action, EntityName, EntityId, OldValues, NewValues, IpAddress, CreatedAt
    FROM [AuditLogs]
    ORDER BY CreatedAt DESC
    OFFSET (@PageNumber - 1) * @PageSize ROWS
    FETCH NEXT @PageSize ROWS ONLY;

    SELECT COUNT(*) AS TotalCount FROM [AuditLogs];
END

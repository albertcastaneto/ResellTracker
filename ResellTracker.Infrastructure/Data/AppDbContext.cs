using Microsoft.EntityFrameworkCore;
using ResellTracker.Core.Models;

namespace ResellTracker.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User>          Users          => Set<User>();
    public DbSet<Supplier>      Suppliers      => Set<Supplier>();
    public DbSet<Category>      Categories     => Set<Category>();
    public DbSet<Platform>      Platforms      => Set<Platform>();
    public DbSet<InventoryItem> InventoryItems => Set<InventoryItem>();
    public DbSet<SaleLog>       SaleLogs       => Set<SaleLog>();
    public DbSet<SkuRegistry>   SkuRegistry    => Set<SkuRegistry>();
    public DbSet<AuditLog>      AuditLogs      => Set<AuditLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        ConfigureUser(modelBuilder);
        ConfigureSupplier(modelBuilder);
        ConfigureCategory(modelBuilder);
        ConfigurePlatform(modelBuilder);
        ConfigureInventoryItem(modelBuilder);
        ConfigureSaleLog(modelBuilder);
        ConfigureSkuRegistry(modelBuilder);
        ConfigureAuditLog(modelBuilder);

        SeedCategories(modelBuilder);
        SeedPlatforms(modelBuilder);
    }

    private static void ConfigureUser(ModelBuilder m)
    {
        m.Entity<User>(e =>
        {
            e.ToTable("Users");
            e.HasKey(u => u.Id);
            e.Property(u => u.Email).IsRequired().HasMaxLength(255);
            e.Property(u => u.DisplayName).IsRequired().HasMaxLength(100);
            e.Property(u => u.Role).IsRequired().HasMaxLength(50);
            e.Property(u => u.Status).IsRequired().HasMaxLength(50);
            e.Property(u => u.CreatedAt).IsRequired();
            e.HasIndex(u => u.Email).IsUnique();
        });
    }

    private static void ConfigureSupplier(ModelBuilder m)
    {
        m.Entity<Supplier>(e =>
        {
            e.ToTable("Suppliers");
            e.HasKey(s => s.Id);
            e.Property(s => s.Name).IsRequired().HasMaxLength(150);
            e.Property(s => s.Type).IsRequired().HasMaxLength(50);
            e.Property(s => s.Location).HasMaxLength(200);
            e.Property(s => s.Notes).HasMaxLength(1000);
            e.Property(s => s.IsActive).IsRequired();
            e.Property(s => s.CreatedAt).IsRequired();
        });
    }

    private static void ConfigureCategory(ModelBuilder m)
    {
        m.Entity<Category>(e =>
        {
            e.ToTable("Categories");
            e.HasKey(c => c.Id);
            e.Property(c => c.Name).IsRequired().HasMaxLength(100);
            e.Property(c => c.CreatedAt).IsRequired();
        });
    }

    private static void ConfigurePlatform(ModelBuilder m)
    {
        m.Entity<Platform>(e =>
        {
            e.ToTable("Platforms");
            e.HasKey(p => p.Id);
            e.Property(p => p.Name).IsRequired().HasMaxLength(100);
            e.Property(p => p.FeePercentage).IsRequired().HasPrecision(5, 2);
            e.Property(p => p.FixedFee).IsRequired().HasPrecision(10, 2);
            e.Property(p => p.DefaultPostage).IsRequired().HasPrecision(10, 2);
            e.Property(p => p.IsActive).IsRequired();
            e.Property(p => p.CreatedAt).IsRequired();
        });
    }

    private static void ConfigureInventoryItem(ModelBuilder m)
    {
        m.Entity<InventoryItem>(e =>
        {
            e.ToTable("InventoryItems");
            e.HasKey(i => i.Id);
            e.Property(i => i.SKU).IsRequired().HasMaxLength(50);
            e.Property(i => i.Brand).IsRequired().HasMaxLength(100);
            e.Property(i => i.Size).IsRequired().HasMaxLength(20);
            e.Property(i => i.Cogs).IsRequired().HasPrecision(10, 2);
            e.Property(i => i.DateListed).IsRequired();
            e.Property(i => i.Status).IsRequired().HasMaxLength(50);
            e.Property(i => i.CreatedAt).IsRequired();

            e.HasIndex(i => i.SKU).IsUnique();

            e.HasOne(i => i.Category).WithMany().HasForeignKey(i => i.CategoryId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(i => i.Supplier).WithMany().HasForeignKey(i => i.SupplierId).OnDelete(DeleteBehavior.SetNull);
            e.HasOne(i => i.Platform).WithMany().HasForeignKey(i => i.PlatformId).OnDelete(DeleteBehavior.SetNull);
        });
    }

    private static void ConfigureSaleLog(ModelBuilder m)
    {
        m.Entity<SaleLog>(e =>
        {
            e.ToTable("SaleLogs");
            e.HasKey(s => s.Id);
            e.Property(s => s.SKU).IsRequired().HasMaxLength(50);
            e.Property(s => s.SalePrice).IsRequired().HasPrecision(10, 2);
            e.Property(s => s.FeePercentage).IsRequired().HasPrecision(5, 2);
            e.Property(s => s.FixedFee).IsRequired().HasPrecision(10, 2);
            e.Property(s => s.Postage).IsRequired().HasPrecision(10, 2);
            e.Property(s => s.NetProfit).IsRequired().HasPrecision(10, 2);
            e.Property(s => s.DaysToSell).IsRequired();
            e.Property(s => s.DateSold).IsRequired();
            e.Property(s => s.CreatedAt).IsRequired();

            e.HasIndex(s => s.InventoryId);

            e.HasOne(s => s.InventoryItem).WithMany().HasForeignKey(s => s.InventoryId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(s => s.Platform).WithMany().HasForeignKey(s => s.PlatformId).OnDelete(DeleteBehavior.Restrict);
        });
    }

    private static void ConfigureSkuRegistry(ModelBuilder m)
    {
        m.Entity<SkuRegistry>(e =>
        {
            e.ToTable("SkuRegistry");
            e.HasKey(s => s.Id);
            e.Property(s => s.SKU).IsRequired().HasMaxLength(50);
            e.Property(s => s.BrandCode).IsRequired().HasMaxLength(10);
            e.Property(s => s.CategoryCode).IsRequired().HasMaxLength(10);
            e.Property(s => s.SizeCode).IsRequired().HasMaxLength(10);
            e.Property(s => s.SupplierCode).IsRequired().HasMaxLength(10);
            e.Property(s => s.SequenceNumber).IsRequired();
            e.Property(s => s.CreatedAt).IsRequired();
            e.HasIndex(s => s.SKU).IsUnique();
        });
    }

    private static void ConfigureAuditLog(ModelBuilder m)
    {
        m.Entity<AuditLog>(e =>
        {
            e.ToTable("AuditLogs");
            e.HasKey(a => a.Id);
            e.Property(a => a.UserEmail).IsRequired().HasMaxLength(255);
            e.Property(a => a.Action).IsRequired().HasMaxLength(100);
            e.Property(a => a.EntityName).IsRequired().HasMaxLength(100);
            e.Property(a => a.EntityId).IsRequired().HasMaxLength(100);
            e.Property(a => a.OldValues).HasColumnType("nvarchar(max)");
            e.Property(a => a.NewValues).HasColumnType("nvarchar(max)");
            e.Property(a => a.IpAddress).HasMaxLength(45);
            e.Property(a => a.CreatedAt).IsRequired();

            e.HasIndex(a => a.CreatedAt);
            e.HasIndex(a => a.EntityName);
            e.HasIndex(a => a.UserEmail);

            e.HasOne<User>().WithMany().HasForeignKey(a => a.UserId).OnDelete(DeleteBehavior.SetNull);
        });
    }

    private static void SeedCategories(ModelBuilder m)
    {
        var now = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        m.Entity<Category>().HasData(
            new Category { Id = new Guid("a0000000-0000-0000-0000-000000000001"), Name = "Tops",        CreatedAt = now },
            new Category { Id = new Guid("a0000000-0000-0000-0000-000000000002"), Name = "Bottoms",     CreatedAt = now },
            new Category { Id = new Guid("a0000000-0000-0000-0000-000000000003"), Name = "Dresses",     CreatedAt = now },
            new Category { Id = new Guid("a0000000-0000-0000-0000-000000000004"), Name = "Outerwear",   CreatedAt = now },
            new Category { Id = new Guid("a0000000-0000-0000-0000-000000000005"), Name = "Shoes",       CreatedAt = now },
            new Category { Id = new Guid("a0000000-0000-0000-0000-000000000006"), Name = "Accessories", CreatedAt = now },
            new Category { Id = new Guid("a0000000-0000-0000-0000-000000000007"), Name = "Other",       CreatedAt = now }
        );
    }

    private static void SeedPlatforms(ModelBuilder m)
    {
        var now = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        m.Entity<Platform>().HasData(
            new Platform { Id = new Guid("b0000000-0000-0000-0000-000000000001"), Name = "eBay",                 FeePercentage = 12.8m, FixedFee = 0.30m, DefaultPostage = 3.99m, IsActive = true, CreatedAt = now },
            new Platform { Id = new Guid("b0000000-0000-0000-0000-000000000002"), Name = "Vinted",               FeePercentage =  5.0m, FixedFee = 0.70m, DefaultPostage = 0.00m, IsActive = true, CreatedAt = now },
            new Platform { Id = new Guid("b0000000-0000-0000-0000-000000000003"), Name = "Depop",                FeePercentage = 10.0m, FixedFee = 0.00m, DefaultPostage = 3.99m, IsActive = true, CreatedAt = now },
            new Platform { Id = new Guid("b0000000-0000-0000-0000-000000000004"), Name = "Facebook Marketplace", FeePercentage =  0.0m, FixedFee = 0.00m, DefaultPostage = 0.00m, IsActive = true, CreatedAt = now },
            new Platform { Id = new Guid("b0000000-0000-0000-0000-000000000005"), Name = "Instagram",            FeePercentage =  5.0m, FixedFee = 0.00m, DefaultPostage = 0.00m, IsActive = true, CreatedAt = now },
            new Platform { Id = new Guid("b0000000-0000-0000-0000-000000000006"), Name = "Other",                FeePercentage =  0.0m, FixedFee = 0.00m, DefaultPostage = 0.00m, IsActive = true, CreatedAt = now }
        );
    }
}

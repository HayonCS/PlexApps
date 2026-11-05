using MudBlazor;
using Microsoft.JSInterop;

public class ThemeService
{
    private readonly IJSRuntime _jsRuntime;

    // Expose the custom theme configuration
    public MudTheme CurrentTheme { get; private set; } = new AppTheme(); 
    public bool IsDarkMode { get; set; } = true;

    // Event notifying listeners (like MainLayout) that a state change happened
    public event Action? OnThemeChanged;

    public ThemeService(IJSRuntime jsRuntime)
    {
        _jsRuntime = jsRuntime;
        // GetDarkModeFromLocalStorage();
    }

    public void ToggleDarkMode()
    {
        IsDarkMode = !IsDarkMode;
        NotifyStateChanged();
    }

    public async Task GetDarkModeFromLocalStorage()
    {
        var darkModeValue = await _jsRuntime.InvokeAsync<string>("localStorage.getItem", "themeServiceDarkMode");
        if (bool.TryParse(darkModeValue, out bool isDark))
        {
            IsDarkMode = isDark;
            // NotifyStateChanged();
        }
    }

    public void SetDarkMode(bool isDark)
    {
        if (IsDarkMode != isDark)
        {
            IsDarkMode = isDark;
            NotifyStateChanged();
        }
    }

    public void UpdateTheme(MudTheme newTheme)
    {
        CurrentTheme = newTheme;
        NotifyStateChanged();
    }

    private async void NotifyStateChanged()
    {
        await _jsRuntime.InvokeVoidAsync("localStorage.setItem", "themeServiceDarkMode", IsDarkMode);
        OnThemeChanged?.Invoke();
    }
}

// Optional: Define your custom brand palettes directly in your theme definition
public class AppTheme : MudTheme
{
    public AppTheme()
    {
        // PaletteLight = new PaletteLight()
        // {
        //     Primary = "#3f51b5",
        //     Secondary = "#ff4081",
        //     AppbarBackground = "#ffffff"
        // };
        // PaletteDark = new PaletteDark()
        // {
        //     Primary = "#757de8",
        //     Secondary = "#ff79b0",
        //     Background = "#1a1a1a"
        // };

        PaletteLight = new PaletteLight()
        {
            Black = "#110e2d",
            AppbarText = "#424242",
            AppbarBackground = "rgba(255,255,255,0.8)",
            DrawerBackground = "#ffffff",
            GrayLight = "#e8e8e8",
            GrayLighter = "#f9f9f9",
        };

        PaletteDark = new PaletteDark()
        {
            Primary = "#7e6fff",
            Surface = "#1e1e2d",
            Background = "#1a1a27",
            BackgroundGray = "#151521",
            AppbarText = "#92929f",
            AppbarBackground = "rgba(26,26,39,0.8)",
            DrawerBackground = "#1a1a27",
            ActionDefault = "#74718e",
            ActionDisabled = "#9999994d",
            ActionDisabledBackground = "#605f6d4d",
            TextPrimary = "#b2b0bf",
            TextSecondary = "#92929f",
            TextDisabled = "#ffffff33",
            DrawerIcon = "#92929f",
            DrawerText = "#92929f",
            GrayLight = "#2a2833",
            GrayLighter = "#1e1e2d",
            Info = "#4a86ff",
            Success = "#3dcb6c",
            Warning = "#ffb545",
            Error = "#ff3f5f",
            LinesDefault = "#33323e",
            TableLines = "#33323e",
            Divider = "#292838",
            OverlayLight = "#1e1e2d80",
        };
    }
}

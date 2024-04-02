/**
 * Created by Sergey Trizna on 28.02.2017.
 */
import { EventEmitter, Inject } from "@angular/core";
import { ProfileService } from "../../services/profile/profile.service";
import { ServerStorageService } from "../../services/storage/server.storage.service";

export class ThemesProvider {
    changed: EventEmitter<any> = new EventEmitter<any>();
    public storagePrefix: string = "color_schema";
    public theme_class: string = "default";
    public loggedUser: boolean = false;
    private colors = {
        default: [
            "#3f3f3f", // 1 - $color-fgrd
            "#878B8E", // 2 - $color-fgrd-mid
            "#EDF1F2", // 3 - $color-bkgd
            "#E2E7EB", // 4 - $color-bkgd-mid
            "#D4DADE", // 5 - $color-bkgd-dark
            "#f6f6f6", // 6 - $color-menu
            "#D98A1C", // 7 - $color-accent
            "#FFFFFF", // 8 - $color-accent-contrast
            "#d8dcdf", // 9 - $color-border // ???
            "#2A8CEA", // 10 - $color-highlight
            "#2A8CEA", // 11 - $color-link
            "#8CBF45", // 12 - $color-success
            "#E67339", // 13 - $color-error
            "#12161A", // 14 - $color-overlay-bkgd
            "#FFFFFF", // 15 - $color-overlay-fgrd
            "#3f3f3f", // 16 - $color-font
            "#12161A", // 17 - $color-font-saturated
            "#bcc3c8", // 18 - $color-default-btn-hover
            "#ac6d16", // 19 - $color-orange-btn-hover
            "#1472cd", // 20 - $color-highlight-dark
            "#e2e3e4", // 21 - $color-highlight-dark-suggestion
            "#c6ced5", // 22 - $color-border // ???
            "rgba(226, 231, 235, 0.5)", // 23 - $color-hover-transparent
            "rgba(51, 60, 69, 0.08)", // 24 - $color-box-shadow,
            "#9dc1f8", // 25 - $color-input-border
            "#e2e7eb", // 26 - $color-bg-adv
            "rgba(51, 60, 69, 0.6)", // 27 $color-adv-font
            "rgb(51, 60, 69)", // 28 $color-adv-font-active
            "rgba(51, 60, 69, 0.85)", // 29 $color-adv-font-hover
            "rgba(255, 255, 255, 0.4)", // 30 $color-border-loader-login
            "#1d10e8", // 31 $color-border-top-loader-login
            "0%",
            "rgba(0, 0, 0, 0.1)", /*color33*/
            "rgba(212, 218, 222, 0.4)" // 34 not found box in grid
        ],
        dark: [
            "#DFEBF3", // 1 - $color-fgrd
            "#b0b3b5", // 2 - $color-fgrd-mid
            "#34404A", // 3 - $color-bkgd
            "#21282E", // 4 - $color-bkgd-mid
            "#121619", // 5 - $color-bkgd-dark
            "#21282E", // 6 - $color-menu
            "#EDA800", // 7 - $color-accent
            "#21282E", // 8 - $color-accent-contrast
            "#546878", // 9 - $color-border
            "#2A8CEA", // 10 - $color-highlight
            "#9ACCFF", // 11 - $color-link
            "#8CBF45", // 12 - $color-success
            "#D95817", // 13 - $color-error
            "#12161A", // 14 - $color-overlay-bkgd
            "#FFFFFF", // 15 - $color-overlay-fgrd
            "#F5F5F5", // 16 - $color-font
            "#FFFFFF", // 17 - $color-font-saturated
            "#3f4e5a", // 18 - $color-default-btn-hover
            "#ac6d16", // 19 - $color-orange-btn-hover
            "#1472cd", // 20 - $color-highlight-dark
            "#353c42", // 21 - $color-highlight-dark-suggestion
            "#546878", // 22 - $color-border
            "rgba(33, 40, 46, 0.5)", // 23 - $color-hover-transparent
            "rgba(33, 40, 46, 0.08)", // 24 - $color-box-shadow,
            "#517cbb", // 25 - $color-input-border
            "#21282e", // 26 - $color-bg-adv
            "rgba(223, 235, 243, 0.6)", // 27 $color-adv-font
            "#dfebf3", // 28 $color-adv-font-active
            "rgba(223, 235, 243, 0.85)", // 29 $color-adv-font-hover
            "rgba(255, 255, 255, 0.4)", // 30 $color-border-loader-login
            "#1d10e8", // 31 $color-border-top-loader-login
            "100%",
            "rgba(0, 0, 0, 0.2)", /*color33*/
            "rgba(18, 22, 25, 0.4)" // 34 not found box in grid
        ]
    };

    constructor(@Inject(ProfileService) protected profileService: ProfileService,
                @Inject(ServerStorageService) public storageService: ServerStorageService) {
        this.profileService.colorSchemaChanged.subscribe(
            (res: any) => {
                this.theme_class = res || 'default';
                this.storageService.store(this.storagePrefix, this.theme_class).subscribe(() => {
                    this.changed.emit(this.theme_class);
                });
            }
        );
    }

    public getCurrentTheme(): string {
        let currentSchema = window.sessionStorage.getItem('tmd.config.user.preferences.color_schema');
        if (currentSchema) {
            const cs = currentSchema.replace(/["']/g, "").replace(/\\/g, '');
            if (!currentSchema || !cs) {
                window.sessionStorage.setItem('tmd.config.user.preferences.color_schema', 'default');
                return 'default';
            } else {
                return cs;
            }
        } else {
            if (!currentSchema) {
                return 'default';
            } else {
                let theme = currentSchema.replace(/["']/g, "");
                return theme.replace(/[\\]/g, "");
            }
        }
    }

    getColorByCode(code: number) {
        let currentTheme = this.getCurrentTheme();
        if (!currentTheme) {
            return 'default';
        }
        if (!this.colors[currentTheme] || !this.colors[currentTheme][code + 1]) {
            // debugger
        }

        return this.colors[currentTheme][code + 1];
    }
}

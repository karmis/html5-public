interface Media {
    Default: 0,
    PhysicalItem: 1,
    Media: 100,
    Subtile: 101,
    Archive: 110,
    Audio: 150,
    Image: 200,
    Doc: [  210,  230 ]
}
export interface AppSettingsInterface{
    /**
     * Names of subtypes of media files
     */
    mediaSubtypes:any;
    /**
     * Subtypes of media files
     */
    subtypes:any;

    /**
     * Tabs for detail view
     */
    tabsType: any;

    /**
     * Icons in the media search
     */
    mediaIcons: any;

    /**
     * Contributor default icon (search suggestion)
     */
    contributorThumb: string;

    /**
     * Return subtype by id
     * @param id
     */
    getSubtype(id: number): number;

    /**
     * Return all subtypes
     */
    getSubtypes(): Object;

    /**
     * Return tab name by id
     */
    getTabName(id: number): string;

    /**
     * Return media icon name
     */
    getMediaIcon(id: number): string|0;

    /**
     * Return contributor default icon
     */
    getContributorThumb(): string;

    /**
     * Check if tabs has tab by id
     */
    checkTabExist (id): boolean;

    /**
     * Return all tabs
     */
    getTabs(): any;

    /**
     * Return all Media Subtypes
     */
    getMediaSubtypes(): Media;
}

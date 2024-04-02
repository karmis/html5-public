export interface PackageInfo {
    [key:string]: {
        licenses: string;
        repository: string;
        publisher: string;
        email: string;
        path: string;
        licenseFile: string;
    }
}

export interface AboutSystemRow {
    Name: string;
    License: string;
    Version: string;
    Children?: AboutSystemRow[]
    ShowMIT?: boolean
    Publisher?: string
}

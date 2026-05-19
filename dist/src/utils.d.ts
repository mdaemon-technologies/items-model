interface IsInterface {
    object: (a: any) => boolean;
    number: (a: any) => boolean;
    string: (a: any) => boolean;
    array: (a: any) => boolean;
    undef: (a: any) => boolean;
    validID: (id: any) => boolean;
}
declare const is: IsInterface;
declare const updateProps: (a: Record<string, any>, b: Record<string, any>) => boolean;
export { is, updateProps };

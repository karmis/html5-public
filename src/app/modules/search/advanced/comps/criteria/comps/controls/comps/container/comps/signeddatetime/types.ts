/**
 * Created by Sergey Trizna on 02.10.2017.
 */
export type AdvancedCriteriaControlSignedDateTimeOptionType = {
    abs: boolean,
    intervalType: 'd'|'h',
};

export type AdvancedCriteriaControlSignedDateTimeDirtyValueType = {
    mode: AdvancedCriteriaControlSignedDateTimeOptionType,
    value: Date
}
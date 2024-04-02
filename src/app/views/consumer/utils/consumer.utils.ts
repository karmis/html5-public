export class ConsumerUtils {
    public static consumerNgOnInit(context) {
        context.item.PrevID = context.item.ID; // 65228
        context.item.ID = context.item.VersionId; // 65228
        context.item.EOM_text = context.item.Duration; // '00:11:55:07'
        context.item.TITLE = context.item.Title; // 'TEST DATASET IX3'
        context.item.VERSIONID1 = context.item.VersionId1; // 'VIDEO'
        context.item.THUMBURL = context.item.ThumbUrl; // 'http://192.168.90.39/getfile.aspx?id=3040426'
        context.typeDetails = 'version-details';
    }
}

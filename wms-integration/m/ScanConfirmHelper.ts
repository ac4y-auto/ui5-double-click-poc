import MessageToast from "sap/m/MessageToast";
import MessageBox from "sap/m/MessageBox";
import Input from "../m/Input";
import type Component from "../Component";

// ─── Típusok ────────────────────────────────────────────

type ScanState = "IDLE" | "PENDING" | "CONFIRMED" | "ERROR";

interface FieldState {
    state: ScanState;
    lastBarcode: string | null;
    timeoutId: ReturnType<typeof setTimeout> | null;
}

/**
 * A kontroller kontextus, amit a helper használ.
 * Bármely UI5 kontroller, aminek van byId, getView és getOwnerComponent metódusa.
 */
export interface ScanConfirmContext {
    byId(id: string): any;
    getView(): any;
    getOwnerComponent(): any;
}

/**
 * Callback típus: az üzleti logika, amit CONFIRMED állapotban kell végrehajtani.
 * Ez a kontroller eredeti _applyScannedFieldValue metódusa.
 */
export type ApplyScannedValueFn = (oScanData: any, strProp: string, strChildProp: string | null) => Promise<any>;

/**
 * Konfigurációs opciók.
 */
export interface ScanConfirmOptions {
    /**
     * Mi történjen ERROR állapot után (MessageBox bezárás):
     * - "reset-to-idle": Teljesen újrakezdi a scant (StockTransferRequest viselkedés)
     * - "reset-to-pending": Visszamegy PENDING-re az eredeti vonalkóddal (BaseDocumentController viselkedés)
     * Default: "reset-to-idle"
     */
    errorBehavior?: "reset-to-idle" | "reset-to-pending";

    /**
     * Confirmed állapot utáni auto-reset timeout (ms).
     * Default: 2000
     */
    confirmResetTimeout?: number;
}

// ─── ScanConfirmHelper ──────────────────────────────────

/**
 * Kétlépcsős vonalkód megerősítés helper.
 *
 * Állapotgép: IDLE → PENDING → CONFIRMED / ERROR
 *
 * Használat:
 * ```typescript
 * // onInit()-ben:
 * this._scanConfirm = new ScanConfirmHelper(this, this._applyScannedFieldValue.bind(this));
 *
 * // onScanFieldSuccess()-ben:
 * await this._scanConfirm.handleScan(oEvent, strProp, strChildProp);
 * ```
 */
export default class ScanConfirmHelper {

    private _fieldScanState: Record<string, FieldState> = {};
    private _ctx: ScanConfirmContext;
    private _applyFn: ApplyScannedValueFn;
    private _errorBehavior: "reset-to-idle" | "reset-to-pending";
    private _confirmResetTimeout: number;

    constructor(ctx: ScanConfirmContext, applyFn: ApplyScannedValueFn, options?: ScanConfirmOptions) {
        this._ctx = ctx;
        this._applyFn = applyFn;
        this._errorBehavior = options?.errorBehavior ?? "reset-to-idle";
        this._confirmResetTimeout = options?.confirmResetTimeout ?? 2000;
    }

    // ─── Publikus API ───────────────────────────────────

    /**
     * Fő belépési pont: scan event kezelése állapotgéppel.
     */
    public async handleScan(oEvent: any, strProp: string, strChildProp: string | null): Promise<void> {

        var oScanData = oEvent.getParameters();
        if (oScanData.cancelled || !oScanData.text)
            return;

        let fieldState = this._getFieldScanState(strProp);
        let scannedBarcode = oScanData.text.trim();

        try {
            switch (fieldState.state) {
                case "IDLE": {
                    // 1. lépés: Első scan → PENDING
                    fieldState.state = "PENDING";
                    fieldState.lastBarcode = scannedBarcode;
                    this._setScanFieldVisual(strProp, "PENDING");
                    MessageToast.show("Először beolvasva – olvasd be újra a megerősítéshez!");
                    break;
                }

                case "PENDING": {
                    if (scannedBarcode === fieldState.lastBarcode) {
                        // 2a. lépés: Ugyanaz a kód → CONFIRMED
                        fieldState.state = "CONFIRMED";
                        this._setScanFieldVisual(strProp, "CONFIRMED");
                        MessageToast.show("Megerősítve!");

                        // Üzleti logika végrehajtása (callback)
                        await this._applyFn(oScanData, strProp, strChildProp);

                        // Auto-reset timeout után
                        fieldState.timeoutId = setTimeout(() => {
                            this._resetScanFieldState(strProp);
                        }, this._confirmResetTimeout);

                    } else {
                        // 2b. lépés: Más kód → ERROR + Alarm téma
                        fieldState.state = "ERROR";
                        this._setScanFieldVisual(strProp, "ERROR");

                        // Alarm téma bekapcsolása
                        this._ctx.getOwnerComponent().getVirtualThemeManager().switchTheme("alarm");

                        MessageBox.error(
                            `Hiba! Nem egyező vonalkód.\nVárt: ${fieldState.lastBarcode}\nKapott: ${scannedBarcode}`,
                            {
                                title: "Vonalkód megerősítés sikertelen",
                                onClose: () => {
                                    // Téma visszaállítása
                                    this._ctx.getOwnerComponent().getVirtualThemeManager().switchTheme("normal");

                                    if (this._errorBehavior === "reset-to-pending") {
                                        // BaseDocumentController viselkedés: PENDING-re áll vissza
                                        fieldState.state = "PENDING";
                                        this._setScanFieldVisual(strProp, "PENDING");
                                    } else {
                                        // StockTransferRequest viselkedés: teljesen reset
                                        this._resetScanFieldState(strProp);
                                    }
                                }
                            }
                        );
                    }
                    break;
                }

                case "CONFIRMED": {
                    // Már megerősítve, reset és új scan indítása
                    this._resetScanFieldState(strProp);
                    fieldState.state = "PENDING";
                    fieldState.lastBarcode = scannedBarcode;
                    this._setScanFieldVisual(strProp, "PENDING");
                    MessageToast.show("Először beolvasva – olvasd be újra a megerősítéshez!");
                    break;
                }

                case "ERROR": {
                    // Error állapotban ignoráljuk (MessageBox nyitva van)
                    break;
                }
            }
        }
        catch (err: any) {
            this._resetScanFieldState(strProp);
            MessageBox.error(err.message, { details: oScanData.text });
        }
    }

    /**
     * Egy mező állapotának resetelése IDLE-ra.
     */
    public resetField(strProp: string): void {
        this._resetScanFieldState(strProp);
    }

    /**
     * Minden mező állapotának resetelése IDLE-ra.
     */
    public resetAll(): void {
        for (const fieldId of Object.keys(this._fieldScanState)) {
            this._resetScanFieldState(fieldId);
        }
    }

    /**
     * Mező aktuális állapotának lekérdezése.
     */
    public getState(strProp: string): ScanState {
        return this._getFieldScanState(strProp).state;
    }

    // ─── Privát helperek ────────────────────────────────

    private _getFieldScanState(fieldId: string): FieldState {
        if (!this._fieldScanState[fieldId]) {
            this._fieldScanState[fieldId] = { state: "IDLE", lastBarcode: null, timeoutId: null };
        }
        return this._fieldScanState[fieldId];
    }

    private _setScanFieldVisual(strProp: string, state: ScanState): void {
        let oInput = this._ctx.byId("id" + strProp) as Input;
        if (!oInput) return;

        oInput.removeStyleClass("scanConfirmPending");
        oInput.removeStyleClass("scanConfirmOk");
        oInput.removeStyleClass("scanConfirmError");

        switch (state) {
            case "PENDING":
                oInput.addStyleClass("scanConfirmPending");
                break;
            case "CONFIRMED":
                oInput.addStyleClass("scanConfirmOk");
                break;
            case "ERROR":
                oInput.addStyleClass("scanConfirmError");
                break;
        }
    }

    private _resetScanFieldState(strProp: string): void {
        let fieldState = this._getFieldScanState(strProp);
        if (fieldState.timeoutId) {
            clearTimeout(fieldState.timeoutId);
        }
        fieldState.state = "IDLE";
        fieldState.lastBarcode = null;
        fieldState.timeoutId = null;
        this._setScanFieldVisual(strProp, "IDLE");
    }
}

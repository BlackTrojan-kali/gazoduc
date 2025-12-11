<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FuelSale extends Model
{
    protected $fillable = [
        'pompe_id',
        'agency_id',
        'article_id',
        'user_id',
        'client_id',
        'total_price',
        'sub_total',
         'unitPrice',
        'quantity',
        'status',
    ];

    protected $casts = [
        'pompe_id ' => 'integer',
        'agency_id' => 'integer',
        'article_id' => 'integer',
        'user_id' => 'integer',
        'client_id' => 'integer',
         'unitPrice' => 'float',
        'sub_total' => 'float',
        'total_price' => 'float',
        'quantity' => 'float',
    ];

    protected static function booted()
    {
        static::saving(function ($sale) {
            if ($sale->unit_price && $sale->quantity) {
                $sale->sub_total = $sale->unit_price * $sale->quantity;
            }
            if (!isset($sale->total_price)) {
                $sale->total_price = $sale->sub_total;
            }
        });
    }

    public function article()
    {
        return $this->belongsTo(Article::class, 'article_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function agency()
    {
        return $this->belongsTo(Agency::class, 'agency_id');
    }

    public function pompe()
    {
        return $this->belongsTo(Pompe::class, 'pompe_id');
    }

    public function client()
    {
        return $this->belongsTo(Client::class, 'client_id');
    }

    // Scopes
    public function scopeOfAgency($query, $agencyId)
    {
        return $query->where('agency_id', $agencyId);
    }

    public function scopeOfMonth($query, $month, $year = null)
    {
        $year = $year ?? now()->year;
        return $query->whereYear('created_at', $year)->whereMonth('created_at', $month);
    }
}

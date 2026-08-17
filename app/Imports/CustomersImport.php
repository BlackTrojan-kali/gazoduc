<?php

namespace App\Imports;

use App\Models\Customer;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;

class CustomersImport implements ToModel, WithHeadingRow, WithValidation
{
    /**
    * @param array $row
    *
    * @return \Illuminate\Database\Eloquent\Model|null
    */
    public function model(array $row)
    {
        return new Customer([
            'name'        => $row['nom'],        // Assurez-vous que l'entête Excel est 'nom'
            'phone'       => $row['telephone'],  // 'telephone'
            'email'       => $row['email'],      // 'email'
            'address'     => $row['adresse'],    // 'adresse'
            'dept_amount' => $row['dette'] ?? 0, // 'dette'
        ]);
    }

    // Validation des lignes Excel
    public function rules(): array
    {
        return [
            'nom' => 'required|string',
            'email' => 'nullable|email|unique:customers,email', // Évite les doublons d'email
        ];
    }
}